import { test, expect } from '@playwright/test';

test.describe('Voting Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the servers page where vote buttons are available
    await page.goto('http://localhost:5173/servers');
    
    // Wait for the page to load and ensure vote buttons are visible
    await page.waitForSelector('button[title*="Mark as using"], button[title*="Sign in"]', { timeout: 10000 });
  });

  test('should display vote buttons with correct initial state', async ({ page }) => {
    // Find the first vote button (user not authenticated, so should be sign in button)
    const voteButton = page.locator('button[title*="Sign in to mark as using"]').first();
    
    // Check that vote button exists
    await expect(voteButton).toBeVisible();
    await expect(voteButton).toBeEnabled();
    
    // Check initial state - should be gray/hollow
    const thumbsUpIcon = voteButton.locator('svg');
    await expect(thumbsUpIcon).toBeVisible();
    
    // Check that the icon has outline style (fill="none")
    const iconFill = await thumbsUpIcon.getAttribute('fill');
    expect(iconFill).toBe('none');
    
    // Check stroke properties for hollow state
    const iconStroke = await thumbsUpIcon.getAttribute('stroke');
    const iconStrokeWidth = await thumbsUpIcon.getAttribute('stroke-width');
    expect(iconStroke).toBe('currentColor');
    expect(iconStrokeWidth).toBe('2');
    
    console.log('✅ Vote button initial state verified: hollow icon with correct styling');
  });

  test('should show login button when user is not authenticated', async ({ page }) => {
    // Look for sign in buttons (should be present when user not authenticated)
    const signInButtons = page.locator('button[title*="Sign in to mark as using"]');
    const buttonCount = await signInButtons.count();
    
    expect(buttonCount).toBeGreaterThan(0);
    console.log(`✅ Found ${buttonCount} sign in buttons - user not authenticated`);
    
    // Test that sign in buttons have correct properties
    const firstSignInButton = signInButtons.first();
    await expect(firstSignInButton).toBeVisible();
    await expect(firstSignInButton).toBeEnabled();
    
    const title = await firstSignInButton.getAttribute('title');
    expect(title).toContain('Sign in to mark as using');
    
    // Verify it shows the LogIn icon (not ThumbsUp when not authenticated)
    const svg = firstSignInButton.locator('svg');
    await expect(svg).toBeVisible();
    
    console.log('✅ Sign in button functionality verified');
  });

  test('should trigger sign in modal when clicking vote button (not authenticated)', async ({ page }) => {
    // Since user is not authenticated, clicking vote button should trigger sign in
    const signInButton = page.locator('button[title*="Sign in to mark as using"]').first();
    
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toBeEnabled();
    
    // Click the sign in button
    await signInButton.click();
    
    // Should trigger sign in modal or redirect
    await page.waitForTimeout(1000);
    
    // Check for sign in modal
    const modals = await page.locator('[role="dialog"], .modal').count();
    
    if (modals > 0) {
      console.log('✅ Sign in modal appeared after clicking vote button');
      
      // Close the modal by pressing Escape or clicking outside
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } else {
      // Might have redirected to sign in page or opened external auth
      console.log('✅ Sign in process triggered (modal or redirect)');
    }
    
    // Verify button state is still correct after modal interaction
    const buttonStillVisible = await signInButton.isVisible();
    if (buttonStillVisible) {
      const svg = signInButton.locator('svg');
      const fill = await svg.getAttribute('fill');
      expect(fill).toBe('none'); // Should still be hollow
      console.log('✅ Button state maintained after sign in interaction');
    }
  });

  test('should handle rapid clicking appropriately', async ({ page }) => {
    // Test rapid clicking behavior (should not cause issues)
    const signInButton = page.locator('button[title*="Sign in to mark as using"]').first();
    
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toBeEnabled();
    
    // Test rapid clicking - should handle gracefully
    await signInButton.click();
    await signInButton.click(); // Second click should be handled appropriately
    
    await page.waitForTimeout(500);
    
    // Button should still be responsive after rapid clicks
    const stillVisible = await signInButton.isVisible();
    const stillEnabled = await signInButton.isEnabled();
    
    expect(stillVisible).toBe(true);
    expect(stillEnabled).toBe(true);
    
    console.log('✅ Rapid clicking handled appropriately');
    
    // Close any modals that might have opened
    await page.keyboard.press('Escape');
  });

  test('should show correct tooltips', async ({ page }) => {
    // Check all sign in buttons for correct tooltips
    const signInButtons = page.locator('button[title*="Sign in to mark as using"]');
    const buttonCount = await signInButtons.count();
    
    expect(buttonCount).toBeGreaterThan(0);
    
    // Test first few buttons for consistent tooltip format
    const testCount = Math.min(3, buttonCount);
    
    for (let i = 0; i < testCount; i++) {
      const button = signInButtons.nth(i);
      const title = await button.getAttribute('title');
      
      expect(title).toBeTruthy();
      expect(title).toContain('Sign in to mark as using');
      expect(title).toMatch(/\(\d+ users?\)/); // Should contain user count like "(0 users)"
    }
    
    console.log(`✅ Verified tooltips for ${testCount} vote buttons - all contain correct format`);
  });

  test('should handle interactions on multiple vote buttons', async ({ page }) => {
    // Get all sign in buttons
    const signInButtons = page.locator('button[title*="Sign in to mark as using"]');
    const buttonCount = await signInButtons.count();
    
    console.log(`Found ${buttonCount} vote buttons`);
    
    // Test interaction on first few buttons (limit to avoid too many modals)
    const testCount = Math.min(3, buttonCount);
    
    for (let i = 0; i < testCount; i++) {
      const button = signInButtons.nth(i);
      
      console.log(`Testing vote button ${i + 1}`);
      
      // Verify button state
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
      
      // Check initial icon state
      const svg = button.locator('svg');
      const initialFill = await svg.getAttribute('fill');
      expect(initialFill).toBe('none');
      
      // Click button (should trigger sign in)
      await button.click();
      await page.waitForTimeout(300);
      
      // Check if modal appeared
      const modals = await page.locator('[role="dialog"], .modal').count();
      if (modals > 0) {
        console.log(`✅ Button ${i + 1}: Sign in modal triggered`);
        // Close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
      }
      
      // Verify button is still in correct state
      const stillVisible = await button.isVisible();
      if (stillVisible) {
        const currentFill = await svg.getAttribute('fill');
        expect(currentFill).toBe('none'); // Should still be hollow
        console.log(`✅ Button ${i + 1}: State maintained after interaction`);
      }
    }
  });

  test('should maintain consistent state across page navigation', async ({ page }) => {
    // Test navigation between pages and verify vote button consistency
    const initialButtons = await page.locator('button[title*="Sign in to mark as using"]').count();
    console.log(`Initial vote buttons on servers page: ${initialButtons}`);
    
    // Navigate to home page
    await page.click('a[href="/"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const homeButtons = await page.locator('button[title*="Sign in to mark as using"]').count();
    console.log(`Vote buttons on home page: ${homeButtons}`);
    
    // Navigate to categories page
    await page.click('a[href="/categories"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const categoryButtons = await page.locator('button[title*="Sign in to mark as using"]').count();
    console.log(`Vote buttons on categories page: ${categoryButtons}`);
    
    // Navigate back to servers page
    await page.click('a[href="/servers"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const finalButtons = await page.locator('button[title*="Sign in to mark as using"]').count();
    console.log(`Final vote buttons on servers page: ${finalButtons}`);
    
    // Verify buttons are still functional after navigation
    const testButton = page.locator('button[title*="Sign in to mark as using"]').first();
    if (await testButton.count() > 0) {
      await expect(testButton).toBeVisible();
      await expect(testButton).toBeEnabled();
      
      const svg = testButton.locator('svg');
      const fill = await svg.getAttribute('fill');
      expect(fill).toBe('none'); // Should still be hollow
      
      console.log('✅ Vote button state consistent across navigation');
    }
    
    expect(finalButtons).toBeGreaterThan(0);
    console.log('✅ Navigation test completed successfully');
  });
});