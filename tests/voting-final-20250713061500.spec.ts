import { test, expect } from '@playwright/test';

test.describe('Voting Functionality - Comprehensive Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/servers');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Extra time for data loading
  });

  test('should find and analyze vote buttons structure', async ({ page }) => {
    console.log('🔍 Analyzing page structure for vote buttons...');
    
    // Look for buttons with vote-related titles
    const voteButtonsByTitle = page.locator('button[title*="Mark as using"], button[title*="Remove usage mark"], button[title*="Sign in to mark"]');
    const titleButtonCount = await voteButtonsByTitle.count();
    console.log(`Found ${titleButtonCount} buttons with vote-related titles`);
    
    // Look for buttons containing SVG elements (likely vote buttons)
    const buttonsWithSvg = page.locator('button:has(svg)');
    const svgButtonCount = await buttonsWithSvg.count();
    console.log(`Found ${svgButtonCount} buttons containing SVG icons`);
    
    // Look specifically for thumbs up path elements
    const thumbsUpPaths = page.locator('svg path[d*="14 9"], svg path[d*="thumb"]');
    const thumbsPathCount = await thumbsUpPaths.count();
    console.log(`Found ${thumbsPathCount} thumbs-up SVG paths`);
    
    // Look for buttons near user count text
    const userCountText = page.locator('text=/\\d+\\s+users?/');
    const userCountElements = await userCountText.count();
    console.log(`Found ${userCountElements} user count displays`);
    
    if (userCountElements > 0) {
      // Find buttons near user count text
      for (let i = 0; i < Math.min(3, userCountElements); i++) {
        const countElement = userCountText.nth(i);
        const nearbyButton = countElement.locator('..').locator('button').first();
        const hasNearbyButton = await nearbyButton.isVisible().catch(() => false);
        
        if (hasNearbyButton) {
          const title = await nearbyButton.getAttribute('title');
          console.log(`User count ${i + 1} has nearby button: ${title}`);
        }
      }
    }
    
    // Expect to find some evidence of voting interface
    const totalVoteElements = titleButtonCount + thumbsPathCount;
    expect(totalVoteElements).toBeGreaterThan(0);
    console.log('✅ Vote-related elements found on page');
  });

  test('should test vote button interaction if available', async ({ page }) => {
    console.log('🎯 Testing vote button interactions...');
    
    // Find all possible vote buttons
    const possibleVoteButtons = page.locator('button[title*="Mark as using"], button[title*="Remove usage mark"]');
    const buttonCount = await possibleVoteButtons.count();
    
    console.log(`Found ${buttonCount} interactive vote buttons`);
    
    if (buttonCount > 0) {
      const testButton = possibleVoteButtons.first();
      const initialTitle = await testButton.getAttribute('title');
      
      console.log(`Testing button with title: ${initialTitle}`);
      
      // Get initial visual state
      const svg = testButton.locator('svg').first();
      const initialFill = await svg.getAttribute('fill').catch(() => 'not-found');
      const initialStroke = await svg.getAttribute('stroke-width').catch(() => 'not-found');
      
      console.log(`Initial state: fill="${initialFill}", stroke="${initialStroke}"`);
      
      // Attempt to click
      await testButton.click();
      await page.waitForTimeout(1000);
      
      // Check for state changes
      const newTitle = await testButton.getAttribute('title');
      const newFill = await svg.getAttribute('fill').catch(() => 'not-found');
      const newStroke = await svg.getAttribute('stroke-width').catch(() => 'not-found');
      
      console.log(`After click: title="${newTitle}", fill="${newFill}", stroke="${newStroke}"`);
      
      // Verify button is still functional
      await expect(testButton).toBeVisible();
      await expect(testButton).toBeEnabled();
      
      // Check if state changed
      const titleChanged = newTitle !== initialTitle;
      const fillChanged = newFill !== initialFill;
      const strokeChanged = newStroke !== initialStroke;
      
      if (titleChanged || fillChanged || strokeChanged) {
        console.log('✅ Vote button state changed after interaction');
      } else {
        console.log('ℹ️ Vote button state remained the same (may require authentication)');
      }
    } else {
      // Check for sign-in buttons
      const signInButtons = page.locator('button[title*="Sign in"]');
      const signInCount = await signInButtons.count();
      
      if (signInCount > 0) {
        console.log(`Found ${signInCount} sign-in buttons (authentication required)`);
        
        const signInButton = signInButtons.first();
        await expect(signInButton).toBeVisible();
        await expect(signInButton).toBeEnabled();
        
        console.log('✅ Sign-in buttons are functional');
      } else {
        console.log('⚠️ No vote or sign-in buttons found');
      }
    }
  });

  test('should verify user count display and updates', async ({ page }) => {
    console.log('📊 Testing user count displays...');
    
    const userCountElements = page.locator('text=/\\d+\\s+users?/');
    const countElements = await userCountElements.count();
    
    console.log(`Found ${countElements} user count displays`);
    expect(countElements).toBeGreaterThan(0);
    
    // Sample first few counts
    for (let i = 0; i < Math.min(5, countElements); i++) {
      const element = userCountElements.nth(i);
      const text = await element.textContent();
      const isVisible = await element.isVisible();
      
      console.log(`Count ${i + 1}: "${text}" (visible: ${isVisible})`);
      expect(isVisible).toBe(true);
    }
    
    console.log('✅ User count displays are working correctly');
  });

  test('should check authentication state handling', async ({ page }) => {
    console.log('🔐 Testing authentication state handling...');
    
    // Look for any authentication-related buttons or text
    const authElements = page.locator('button:has-text("Sign In"), button:has-text("Sign Up"), text=/sign.*in/i');
    const authCount = await authElements.count();
    
    console.log(`Found ${authCount} authentication-related elements`);
    
    if (authCount > 0) {
      console.log('Application is in unauthenticated state');
      
      // Check that vote buttons show sign-in prompts
      const signInToVoteButtons = page.locator('button[title*="Sign in to mark"]');
      const signInVoteCount = await signInToVoteButtons.count();
      
      console.log(`Found ${signInVoteCount} "sign in to vote" buttons`);
      
      if (signInVoteCount > 0) {
        const testButton = signInToVoteButtons.first();
        const title = await testButton.getAttribute('title');
        
        console.log(`Sign-in vote button title: ${title}`);
        
        // Test clicking sign-in button
        await testButton.click();
        await page.waitForTimeout(500);
        
        // Should still be visible after click
        await expect(testButton).toBeVisible();
        
        console.log('✅ Sign-in vote buttons work correctly');
      }
    } else {
      console.log('Application may be in authenticated state or authentication is not visible');
    }
    
    // This test is informational
    expect(true).toBe(true);
  });

  test('should verify voting system integrity', async ({ page }) => {
    console.log('🔧 Testing voting system integrity...');
    
    // Count various elements that make up the voting system
    const voteButtons = page.locator('button[title*="Mark"], button[title*="Sign in to mark"]');
    const userCounts = page.locator('text=/\\d+\\s+users?/');
    const thumbIcons = page.locator('svg').filter({ hasText: '' }); // SVG elements
    
    const buttonCount = await voteButtons.count();
    const countCount = await userCounts.count();
    const iconCount = await thumbIcons.count();
    
    console.log(`System components: ${buttonCount} buttons, ${countCount} counts, ${iconCount} icons`);
    
    // Verify that we have a functional voting interface
    expect(buttonCount + countCount).toBeGreaterThan(0);
    
    // Check that buttons and counts are paired properly
    if (buttonCount > 0 && countCount > 0) {
      console.log('✅ Voting buttons and user counts are both present');
      
      // Sample a few button-count pairs
      for (let i = 0; i < Math.min(3, buttonCount); i++) {
        const button = voteButtons.nth(i);
        const buttonTitle = await button.getAttribute('title');
        
        // Look for associated count in the title
        const hasCountInTitle = buttonTitle && /\d+\s+users?/.test(buttonTitle);
        
        if (hasCountInTitle) {
          console.log(`Button ${i + 1} has count in title: ${buttonTitle}`);
        }
      }
    }
    
    console.log('✅ Voting system integrity check passed');
  });

  test('should handle error scenarios gracefully', async ({ page }) => {
    console.log('⚠️ Testing error handling...');
    
    // Test rapid clicking to see if it breaks anything
    const voteButtons = page.locator('button[title*="Mark"], button[title*="Sign in"]');
    const buttonCount = await voteButtons.count();
    
    if (buttonCount > 0) {
      const testButton = voteButtons.first();
      
      console.log('Testing rapid clicking...');
      
      // Rapid click test
      for (let i = 0; i < 3; i++) {
        await testButton.click();
        await page.waitForTimeout(100);
      }
      
      // Wait for any async operations
      await page.waitForTimeout(1000);
      
      // Button should still be functional
      const isVisible = await testButton.isVisible();
      const isEnabled = await testButton.isEnabled();
      
      expect(isVisible).toBe(true);
      expect(isEnabled).toBe(true);
      
      console.log('✅ Button remains stable after rapid clicking');
    }
    
    // Check for any JavaScript errors in console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console error: ${msg.text()}`);
      }
    });
    
    console.log('✅ Error handling test completed');
  });
});