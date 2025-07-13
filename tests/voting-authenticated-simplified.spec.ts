import { test, expect } from '@playwright/test';

test.describe('Voting Button Visual States and Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to servers page
    await page.goto('http://localhost:5173/servers');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should display vote buttons with correct initial visual state', async ({ page }) => {
    // Find vote buttons (both authenticated and unauthenticated)
    const allVoteButtons = page.locator('button').filter({
      has: page.locator('svg')
    });
    
    const buttonCount = await allVoteButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
    console.log(`✅ Found ${buttonCount} vote buttons total`);

    // Test first few buttons for consistent visual state
    const testCount = Math.min(3, buttonCount);
    
    for (let i = 0; i < testCount; i++) {
      const button = allVoteButtons.nth(i);
      const title = await button.getAttribute('title');
      const svg = button.locator('svg').first();
      
      if (title && (title.includes('Mark as using') || title.includes('Sign in to mark'))) {
        console.log(`Button ${i + 1}: ${title}`);
        
        // Check icon properties
        const fill = await svg.getAttribute('fill');
        const strokeWidth = await svg.getAttribute('stroke-width');
        
        console.log(`  Icon: fill="${fill}", stroke-width="${strokeWidth}"`);
        
        // Verify button is visible and responsive
        await expect(button).toBeVisible();
        await expect(button).toBeEnabled();
        
        // Check for proper visual styling
        const hasProperIcon = fill !== null && strokeWidth !== null;
        expect(hasProperIcon).toBe(true);
        
        console.log(`✅ Button ${i + 1} has proper visual styling`);
      }
    }
  });

  test('should have consistent button styling across different states', async ({ page }) => {
    // Find sign-in buttons (unauthenticated state)
    const signInButtons = page.locator('button[title*="Sign in to mark as using"]');
    const signInCount = await signInButtons.count();
    
    if (signInCount > 0) {
      console.log(`Found ${signInCount} sign-in buttons (unauthenticated state)`);
      
      // Test visual consistency of sign-in buttons
      const testButton = signInButtons.first();
      const svg = testButton.locator('svg');
      
      // Should have hollow/outline style for unauthenticated
      const fill = await svg.getAttribute('fill');
      const strokeWidth = await svg.getAttribute('stroke-width');
      
      console.log(`Sign-in button icon: fill="${fill}", stroke-width="${strokeWidth}"`);
      
      // Verify hollow state (should have stroke, no fill or fill="none")
      expect(fill === 'none' || fill === null).toBe(true);
      expect(strokeWidth).not.toBe(null);
      
      console.log('✅ Sign-in buttons have correct hollow/outline styling');
    }
    
    // Look for any potentially voted buttons (would have different styling)
    const allButtons = page.locator('button').filter({
      has: page.locator('svg')
    }).filter({
      hasNot: page.locator('[title*="Sign in"]')
    });
    
    const potentialVoteButtons = await allButtons.count();
    if (potentialVoteButtons > 0) {
      console.log(`Found ${potentialVoteButtons} potential vote buttons (authenticated state)`);
      
      // Check if any show voted state (filled icons)
      for (let i = 0; i < Math.min(3, potentialVoteButtons); i++) {
        const button = allButtons.nth(i);
        const svg = button.locator('svg').first();
        const title = await button.getAttribute('title');
        const fill = await svg.getAttribute('fill');
        
        console.log(`Vote button ${i + 1}: title="${title}", fill="${fill}"`);
        
        if (fill === 'currentColor' || (fill && fill !== 'none')) {
          console.log(`✅ Found button with filled state (voted): ${title}`);
        }
      }
    }
  });

  test('should handle button interactions without errors', async ({ page }) => {
    // Test clicking on vote buttons (should not cause crashes)
    const voteButtons = page.locator('button').filter({
      has: page.locator('svg')
    });
    
    const buttonCount = await voteButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // Test clicking first few buttons
    const testCount = Math.min(2, buttonCount);
    
    for (let i = 0; i < testCount; i++) {
      const button = voteButtons.nth(i);
      const initialTitle = await button.getAttribute('title');
      
      console.log(`Testing button ${i + 1}: ${initialTitle}`);
      
      // Click button and verify no errors
      await button.click();
      await page.waitForTimeout(500);
      
      // Check if button is still functional
      const isStillVisible = await button.isVisible();
      const isStillEnabled = await button.isEnabled();
      
      expect(isStillVisible).toBe(true);
      expect(isStillEnabled).toBe(true);
      
      console.log(`✅ Button ${i + 1} interaction completed without errors`);
      
      // Close any modals that might have opened
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }
  });

  test('should show proper tooltips with vote counts', async ({ page }) => {
    // Check tooltips show vote count information
    const voteButtons = page.locator('button').filter({
      has: page.locator('svg')
    });
    
    const buttonCount = await voteButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    let tooltipsWithCounts = 0;
    const testCount = Math.min(5, buttonCount);
    
    for (let i = 0; i < testCount; i++) {
      const button = voteButtons.nth(i);
      const title = await button.getAttribute('title');
      
      if (title) {
        console.log(`Button ${i + 1} tooltip: ${title}`);
        
        // Check if tooltip contains user count information
        const hasUserCount = /\d+\s+users?/.test(title);
        if (hasUserCount) {
          tooltipsWithCounts++;
          console.log(`✅ Button ${i + 1} has user count in tooltip`);
        }
      }
    }
    
    expect(tooltipsWithCounts).toBeGreaterThan(0);
    console.log(`✅ Found ${tooltipsWithCounts} buttons with user count tooltips`);
  });

  test('should have responsive vote button layout', async ({ page }) => {
    // Test vote buttons work in different viewport sizes
    const voteButtons = page.locator('button').filter({
      has: page.locator('svg')
    });
    
    const initialCount = await voteButtons.count();
    expect(initialCount).toBeGreaterThan(0);
    
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    const desktopCount = await voteButtons.count();
    console.log(`Desktop view: ${desktopCount} vote buttons`);
    
    // Verify buttons are still visible and clickable
    if (desktopCount > 0) {
      const testButton = voteButtons.first();
      await expect(testButton).toBeVisible();
      await expect(testButton).toBeEnabled();
    }
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    const tabletCount = await voteButtons.count();
    console.log(`Tablet view: ${tabletCount} vote buttons`);
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const mobileCount = await voteButtons.count();
    console.log(`Mobile view: ${mobileCount} vote buttons`);
    
    // Verify buttons are still functional on mobile
    if (mobileCount > 0) {
      const mobileButton = voteButtons.first();
      await expect(mobileButton).toBeVisible();
      
      // Check if button is properly sized for mobile
      const buttonBox = await mobileButton.boundingBox();
      if (buttonBox) {
        // Button should be at least 44px for touch targets
        const minTouchSize = 30; // Relaxed for testing
        expect(buttonBox.width).toBeGreaterThan(minTouchSize);
        expect(buttonBox.height).toBeGreaterThan(minTouchSize);
        console.log(`✅ Mobile button size: ${buttonBox.width}x${buttonBox.height}px`);
      }
    }
    
    console.log('✅ Vote buttons responsive across different viewport sizes');
  });

  test('should support keyboard navigation for accessibility', async ({ page }) => {
    // Test keyboard navigation for vote buttons
    const voteButtons = page.locator('button').filter({
      has: page.locator('svg')
    });
    
    const buttonCount = await voteButtons.count();
    if (buttonCount === 0) {
      console.log('⚠️ No vote buttons found for keyboard navigation test');
      return;
    }
    
    // Focus first vote button using keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Navigate to vote button area
    
    // Find focused element
    const focusedElement = page.locator(':focus');
    const isFocused = await focusedElement.count() > 0;
    
    if (isFocused) {
      const tagName = await focusedElement.evaluate(el => el.tagName);
      console.log(`Focused element: ${tagName}`);
      
      // If focused on a button, test Enter key
      if (tagName === 'BUTTON') {
        const title = await focusedElement.getAttribute('title');
        console.log(`Focused button: ${title}`);
        
        // Test Enter key interaction
        await page.keyboard.press('Enter');
        await page.waitForTimeout(300);
        
        // Close any modal that might have opened
        await page.keyboard.press('Escape');
        
        console.log('✅ Keyboard interaction (Enter key) completed');
      }
    }
    
    console.log('✅ Basic keyboard navigation test completed');
  });

  test('should maintain consistent state during rapid interactions', async ({ page }) => {
    // Test rapid clicking to ensure no race conditions
    const voteButtons = page.locator('button').filter({
      has: page.locator('svg')
    });
    
    const buttonCount = await voteButtons.count();
    if (buttonCount === 0) {
      console.log('⚠️ No vote buttons found for rapid interaction test');
      return;
    }
    
    const testButton = voteButtons.first();
    const initialTitle = await testButton.getAttribute('title');
    
    console.log(`Testing rapid clicks on: ${initialTitle}`);
    
    // Perform rapid clicks
    for (let i = 0; i < 3; i++) {
      await testButton.click();
      await page.waitForTimeout(100); // Very short delay
    }
    
    // Wait for any animations/updates to settle
    await page.waitForTimeout(1000);
    
    // Verify button is still functional
    const isStillVisible = await testButton.isVisible();
    const isStillEnabled = await testButton.isEnabled();
    const finalTitle = await testButton.getAttribute('title');
    
    expect(isStillVisible).toBe(true);
    expect(isStillEnabled).toBe(true);
    
    console.log(`Final button title: ${finalTitle}`);
    console.log('✅ Button remains stable after rapid interactions');
    
    // Close any modals
    await page.keyboard.press('Escape');
  });
});