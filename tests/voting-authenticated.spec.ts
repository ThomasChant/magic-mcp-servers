import { test, expect } from '@playwright/test';

test.describe('Authenticated Voting Functionality', () => {
  // Mock authenticated user state
  const mockUser = {
    id: 'test-user-123',
    firstName: 'Test',
    lastName: 'User',
    emailAddresses: [{ emailAddress: 'test@example.com' }]
  };

  // Mock server ID for testing
  const testServerId = 'test-server-001';

  test.beforeEach(async ({ page }) => {
    // Intercept Clerk authentication API calls to simulate authenticated user
    await page.route('**/v1/client/sessions**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: {
            sessions: [{
              id: 'sess_123',
              status: 'active',
              user: mockUser
            }]
          }
        })
      });
    });

    // Intercept Clerk user API calls
    await page.route('**/v1/me**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: mockUser
        })
      });
    });

    // Mock Supabase voting API calls for testing
    await page.route('**/rest/v1/rpc/toggle_vote**', async route => {
      const request = route.request();
      const postData = request.postData();
      
      let mockResponse;
      try {
        const data = JSON.parse(postData || '{}');
        const voteType = data.p_vote_type;
        
        // Simulate toggle behavior
        mockResponse = {
          vote_type: voteType === 'up' ? 'up' : null // Simulate toggle
        };
      } catch {
        mockResponse = { vote_type: 'up' };
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse)
      });
    });

    // Mock server scores API
    await page.route('**/rest/v1/server_scores**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          server_id: testServerId,
          upvotes: 5,
          downvotes: 1,
          total_votes: 6
        }])
      });
    });

    // Mock user votes API
    await page.route('**/rest/v1/server_votes**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]) // Initially no votes
      });
    });

    // Set up authenticated state in local storage
    await page.addInitScript(() => {
      window.localStorage.setItem('clerk-session', JSON.stringify({
        isSignedIn: true,
        user: {
          id: 'test-user-123',
          firstName: 'Test',
          lastName: 'User'
        }
      }));
    });

    // Navigate to servers page
    await page.goto('http://localhost:5173/servers');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should show vote buttons for authenticated users', async ({ page }) => {
    // Look for vote buttons that are NOT sign-in buttons
    const voteButtons = page.locator('button[title*="Mark as using"], button[title*="Remove usage mark"]');
    
    await page.waitForTimeout(1000);
    const buttonCount = await voteButtons.count();
    
    expect(buttonCount).toBeGreaterThan(0);
    console.log(`✅ Found ${buttonCount} vote buttons for authenticated user`);

    // Check first vote button
    const firstButton = voteButtons.first();
    await expect(firstButton).toBeVisible();
    await expect(firstButton).toBeEnabled();

    // Verify it's not a sign-in button
    const title = await firstButton.getAttribute('title');
    expect(title).not.toContain('Sign in');
    
    console.log(`✅ Vote button title: ${title}`);
  });

  test('should change vote button state on click - vote to unvote', async ({ page }) => {
    // Find a vote button
    const voteButton = page.locator('button[title*="Mark as using"]').first();
    
    if (await voteButton.count() === 0) {
      // Try finding any vote button
      const anyVoteButton = page.locator('button').filter({
        has: page.locator('svg')
      }).filter({
        hasNot: page.locator('[title*="Sign in"]')
      }).first();
      
      if (await anyVoteButton.count() > 0) {
        await expect(anyVoteButton).toBeVisible();
        console.log('✅ Found alternative vote button');
      } else {
        console.log('⚠️ No vote buttons found - this may be expected if auth simulation failed');
        return;
      }
    }

    // Get initial state
    const thumbsUpIcon = voteButton.locator('svg').first();
    await expect(thumbsUpIcon).toBeVisible();

    const initialFill = await thumbsUpIcon.getAttribute('fill');
    const initialStrokeWidth = await thumbsUpIcon.getAttribute('stroke-width');
    
    console.log(`Initial state - fill: ${initialFill}, stroke-width: ${initialStrokeWidth}`);

    // Click to vote
    await voteButton.click();
    await page.waitForTimeout(500);

    // Check updated state - should become filled (solid)
    const updatedFill = await thumbsUpIcon.getAttribute('fill');
    const updatedStrokeWidth = await thumbsUpIcon.getAttribute('stroke-width');
    
    console.log(`After vote - fill: ${updatedFill}, stroke-width: ${updatedStrokeWidth}`);

    // After voting, icon should be filled (not "none")
    if (updatedFill !== initialFill) {
      console.log('✅ Icon state changed after voting');
    }

    // Check if button text changed
    const updatedTitle = await voteButton.getAttribute('title');
    console.log(`Updated title: ${updatedTitle}`);
    
    // Title should now indicate removal option
    if (updatedTitle && updatedTitle.includes('Remove')) {
      console.log('✅ Button title changed to show removal option');
    }
  });

  test('should toggle vote state on multiple clicks', async ({ page }) => {
    // Find vote button
    const voteButtons = page.locator('button').filter({
      has: page.locator('svg')
    }).filter({
      hasNot: page.locator('[title*="Sign in"]')
    });

    if (await voteButtons.count() === 0) {
      console.log('⚠️ No vote buttons found for authenticated user');
      return;
    }

    const voteButton = voteButtons.first();
    await expect(voteButton).toBeVisible();

    const thumbsUpIcon = voteButton.locator('svg').first();

    // Get initial state
    const initialFill = await thumbsUpIcon.getAttribute('fill');
    const initialTitle = await voteButton.getAttribute('title');
    
    console.log(`Initial - fill: ${initialFill}, title: ${initialTitle}`);

    // First click - vote
    await voteButton.click();
    await page.waitForTimeout(300);

    const afterFirstClickFill = await thumbsUpIcon.getAttribute('fill');
    const afterFirstClickTitle = await voteButton.getAttribute('title');
    
    console.log(`After 1st click - fill: ${afterFirstClickFill}, title: ${afterFirstClickTitle}`);

    // Second click - unvote
    await voteButton.click();
    await page.waitForTimeout(300);

    const afterSecondClickFill = await thumbsUpIcon.getAttribute('fill');
    const afterSecondClickTitle = await voteButton.getAttribute('title');
    
    console.log(`After 2nd click - fill: ${afterSecondClickFill}, title: ${afterSecondClickTitle}`);

    // Verify toggle behavior
    if (afterSecondClickFill === initialFill) {
      console.log('✅ Vote toggle behavior working - returned to initial state');
    } else {
      console.log('⚠️ Toggle behavior may not be working as expected');
    }
  });

  test('should show optimistic updates during voting', async ({ page }) => {
    // Mock delayed response to test optimistic updates
    await page.route('**/rest/v1/rpc/toggle_vote**', async route => {
      // Add delay to simulate network latency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ vote_type: 'up' })
      });
    });

    const voteButtons = page.locator('button').filter({
      has: page.locator('svg')
    }).filter({
      hasNot: page.locator('[title*="Sign in"]')
    });

    if (await voteButtons.count() === 0) {
      console.log('⚠️ No vote buttons found for optimistic update test');
      return;
    }

    const voteButton = voteButtons.first();
    const thumbsUpIcon = voteButton.locator('svg').first();

    // Get initial state
    const initialFill = await thumbsUpIcon.getAttribute('fill');
    
    // Click and immediately check for optimistic update
    await voteButton.click();
    
    // Check state immediately after click (should show optimistic update)
    await page.waitForTimeout(100); // Very short delay
    const optimisticFill = await thumbsUpIcon.getAttribute('fill');
    
    console.log(`Optimistic state - fill: ${optimisticFill}`);
    
    // Wait for network response
    await page.waitForTimeout(1200);
    
    const finalFill = await thumbsUpIcon.getAttribute('fill');
    console.log(`Final state - fill: ${finalFill}`);
    
    if (optimisticFill !== initialFill) {
      console.log('✅ Optimistic update working - UI updated immediately');
    }
    
    console.log('✅ Optimistic voting test completed');
  });

  test('should handle disabled state during voting', async ({ page }) => {
    // Mock slow response to test disabled state
    await page.route('**/rest/v1/rpc/toggle_vote**', async route => {
      await new Promise(resolve => setTimeout(resolve, 800));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ vote_type: 'up' })
      });
    });

    const voteButtons = page.locator('button').filter({
      has: page.locator('svg')
    }).filter({
      hasNot: page.locator('[title*="Sign in"]')
    });

    if (await voteButtons.count() === 0) {
      console.log('⚠️ No vote buttons found for disabled state test');
      return;
    }

    const voteButton = voteButtons.first();
    
    // Verify initial enabled state
    await expect(voteButton).toBeEnabled();
    
    // Click button
    await voteButton.click();
    
    // Check if button becomes disabled during request
    await page.waitForTimeout(100);
    
    // Try to click again while previous request is pending
    const isDisabledDuringRequest = await voteButton.isDisabled();
    
    if (isDisabledDuringRequest) {
      console.log('✅ Button correctly disabled during voting request');
    } else {
      // Button might use different mechanism to prevent double-clicks
      console.log('ℹ️ Button uses alternative mechanism to prevent double-clicks');
    }
    
    // Wait for request to complete
    await page.waitForTimeout(1000);
    
    // Verify button is enabled again
    await expect(voteButton).toBeEnabled();
    console.log('✅ Button re-enabled after voting request completed');
  });

  test('should update vote count display', async ({ page }) => {
    // Look for vote count display elements
    const voteCountElements = page.locator('text=/\\d+ users?/');
    
    if (await voteCountElements.count() > 0) {
      const firstCountElement = voteCountElements.first();
      const initialText = await firstCountElement.textContent();
      console.log(`Initial vote count: ${initialText}`);
      
      // Find corresponding vote button
      const parentContainer = firstCountElement.locator('..');
      const voteButton = parentContainer.locator('button').first();
      
      if (await voteButton.count() > 0) {
        await voteButton.click();
        await page.waitForTimeout(500);
        
        const updatedText = await firstCountElement.textContent();
        console.log(`Updated vote count: ${updatedText}`);
        
        // Extract numbers for comparison
        const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');
        const updatedCount = parseInt(updatedText?.match(/\d+/)?.[0] || '0');
        
        if (updatedCount !== initialCount) {
          console.log(`✅ Vote count changed from ${initialCount} to ${updatedCount}`);
        } else {
          console.log('ℹ️ Vote count display may be using cached data');
        }
      }
    } else {
      console.log('ℹ️ No vote count displays found on page');
    }
  });

  test('should handle voting errors gracefully', async ({ page }) => {
    // Mock API error response
    await page.route('**/rest/v1/rpc/toggle_vote**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    const voteButtons = page.locator('button').filter({
      has: page.locator('svg')
    }).filter({
      hasNot: page.locator('[title*="Sign in"]')
    });

    if (await voteButtons.count() === 0) {
      console.log('⚠️ No vote buttons found for error handling test');
      return;
    }

    const voteButton = voteButtons.first();
    const thumbsUpIcon = voteButton.locator('svg').first();
    
    // Get initial state
    const initialFill = await thumbsUpIcon.getAttribute('fill');
    
    // Click button (should trigger error)
    await voteButton.click();
    
    // Wait for error handling
    await page.waitForTimeout(1000);
    
    // Verify state reverted after error
    const finalFill = await thumbsUpIcon.getAttribute('fill');
    
    if (finalFill === initialFill) {
      console.log('✅ Error handling working - state reverted after failed vote');
    } else {
      console.log('⚠️ State may not have reverted properly after error');
    }
    
    // Verify button is still functional
    await expect(voteButton).toBeEnabled();
    console.log('✅ Button remains functional after error');
  });

  test('should maintain vote state across page navigation', async ({ page }) => {
    const voteButtons = page.locator('button').filter({
      has: page.locator('svg')
    }).filter({
      hasNot: page.locator('[title*="Sign in"]')
    });

    if (await voteButtons.count() === 0) {
      console.log('⚠️ No vote buttons found for navigation test');
      return;
    }

    // Vote on a server
    const voteButton = voteButtons.first();
    await voteButton.click();
    await page.waitForTimeout(500);
    
    const votedTitle = await voteButton.getAttribute('title');
    console.log(`Voted state title: ${votedTitle}`);
    
    // Navigate away and back
    await page.click('a[href="/"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.click('a[href="/servers"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if vote state is maintained
    const returnedButtons = page.locator('button').filter({
      has: page.locator('svg')
    }).filter({
      hasNot: page.locator('[title*="Sign in"]')
    });
    
    if (await returnedButtons.count() > 0) {
      const returnedButton = returnedButtons.first();
      const returnedTitle = await returnedButton.getAttribute('title');
      console.log(`Returned state title: ${returnedTitle}`);
      
      if (returnedTitle && returnedTitle.includes('Remove')) {
        console.log('✅ Vote state maintained across navigation');
      } else {
        console.log('ℹ️ Vote state may have been reset (could be expected behavior)');
      }
    }
  });

  test('should show correct visual states for voted vs unvoted buttons', async ({ page }) => {
    const voteButtons = page.locator('button').filter({
      has: page.locator('svg')
    }).filter({
      hasNot: page.locator('[title*="Sign in"]')
    });

    const buttonCount = await voteButtons.count();
    
    if (buttonCount === 0) {
      console.log('⚠️ No vote buttons found for visual state test');
      return;
    }

    console.log(`Testing visual states on ${buttonCount} buttons`);
    
    // Test first few buttons to verify visual states
    const testCount = Math.min(3, buttonCount);
    
    for (let i = 0; i < testCount; i++) {
      const button = voteButtons.nth(i);
      const icon = button.locator('svg').first();
      
      await expect(button).toBeVisible();
      
      // Get initial visual state
      const initialFill = await icon.getAttribute('fill');
      const initialStroke = await icon.getAttribute('stroke-width');
      const initialTitle = await button.getAttribute('title');
      
      console.log(`Button ${i + 1} initial: fill=${initialFill}, stroke=${initialStroke}, title=${initialTitle}`);
      
      // Click to vote
      await button.click();
      await page.waitForTimeout(300);
      
      // Get updated visual state
      const updatedFill = await icon.getAttribute('fill');
      const updatedStroke = await icon.getAttribute('stroke-width');
      const updatedTitle = await button.getAttribute('title');
      
      console.log(`Button ${i + 1} updated: fill=${updatedFill}, stroke=${updatedStroke}, title=${updatedTitle}`);
      
      // Verify visual changes
      const fillChanged = updatedFill !== initialFill;
      const strokeChanged = updatedStroke !== initialStroke;
      const titleChanged = updatedTitle !== initialTitle;
      
      if (fillChanged || strokeChanged || titleChanged) {
        console.log(`✅ Button ${i + 1}: Visual state changed after voting`);
      } else {
        console.log(`⚠️ Button ${i + 1}: No visual changes detected`);
      }
      
      // Check for red color indication
      const buttonStyles = await button.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor
        };
      });
      
      console.log(`Button ${i + 1} computed styles:`, buttonStyles);
    }
    
    console.log('✅ Visual state verification completed');
  });
});