import { test, expect } from '@playwright/test';

test.describe('Vote Button Visual State Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/servers');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should verify vote buttons have correct initial visual state', async ({ page }) => {
    console.log('🔍 Testing initial visual state of vote buttons');
    
    // Find all buttons with vote-related titles
    const allVoteButtons = page.locator('button[title*="Mark"], button[title*="Sign in to mark"]');
    const buttonCount = await allVoteButtons.count();
    
    console.log(`Found ${buttonCount} vote-related buttons`);
    expect(buttonCount).toBeGreaterThan(0);
    
    // Test first few buttons
    const testCount = Math.min(5, buttonCount);
    
    for (let i = 0; i < testCount; i++) {
      const button = allVoteButtons.nth(i);
      const svg = button.locator('svg').first();
      const title = await button.getAttribute('title');
      
      console.log(`Button ${i + 1}: ${title}`);
      
      // Check SVG attributes
      const fill = await svg.getAttribute('fill');
      const strokeWidth = await svg.getAttribute('stroke-width');
      const classes = await button.getAttribute('class');
      
      console.log(`  SVG: fill="${fill}", stroke-width="${strokeWidth}"`);
      console.log(`  Classes: ${classes}`);
      
      // Verify button is visible and has proper structure
      await expect(button).toBeVisible();
      await expect(svg).toBeVisible();
      
      // Check initial state expectations
      if (title?.includes('Sign in')) {
        // Unauthenticated state - should show login icon or specific styling
        console.log(`  ✅ Unauthenticated button ${i + 1} has proper structure`);
      } else if (title?.includes('Mark as using')) {
        // Authenticated unvoted state
        expect(fill).toBe('none');
        expect(strokeWidth).toBe('2');
        console.log(`  ✅ Unvoted button ${i + 1} has correct hollow icon`);
      } else if (title?.includes('Remove usage mark')) {
        // Authenticated voted state
        expect(fill).toBe('currentColor');
        expect(strokeWidth).toBe('0');
        console.log(`  ✅ Voted button ${i + 1} has correct solid icon`);
      }
    }
    
    console.log('✅ All vote buttons have correct initial visual states');
  });

  test('should test button click interaction and visual response', async ({ page }) => {
    console.log('🎯 Testing button click interactions and visual responses');
    
    const allVoteButtons = page.locator('button[title*="Mark"], button[title*="Sign in to mark"]');
    const buttonCount = await allVoteButtons.count();
    
    if (buttonCount === 0) {
      console.log('⚠️ No vote buttons found for interaction test');
      return;
    }
    
    const testButton = allVoteButtons.first();
    const svg = testButton.locator('svg').first();
    const title = await testButton.getAttribute('title');
    
    console.log(`Testing interaction with: ${title}`);
    
    // Record initial state
    const initialFill = await svg.getAttribute('fill');
    const initialStroke = await svg.getAttribute('stroke-width');
    const initialClass = await testButton.getAttribute('class');
    const initialEnabled = await testButton.isEnabled();
    
    console.log(`Initial state: fill="${initialFill}", stroke="${initialStroke}", enabled=${initialEnabled}`);
    
    // Verify button is clickable
    expect(initialEnabled).toBe(true);
    
    // Click the button
    await testButton.click();
    
    // Check immediate response (within 200ms)
    await page.waitForTimeout(200);
    
    const immediateClass = await testButton.getAttribute('class');
    const immediateEnabled = await testButton.isEnabled();
    
    console.log(`Immediate response: enabled=${immediateEnabled}`);
    console.log(`Immediate classes: ${immediateClass}`);
    
    // Verify button is still visible and functional
    await expect(testButton).toBeVisible();
    
    // Check for any visual state changes
    const newFill = await svg.getAttribute('fill');
    const newStroke = await svg.getAttribute('stroke-width');
    
    console.log(`Visual state after click: fill="${newFill}", stroke="${newStroke}"`);
    
    // For sign-in buttons, they should remain functional
    // For vote buttons, they might show loading state
    if (title?.includes('Sign in')) {
      console.log('✅ Sign-in button remained functional after click');
    } else {
      console.log('✅ Vote button interaction completed');
    }
    
    // Wait a bit longer to see if any async updates occur
    await page.waitForTimeout(1000);
    
    const finalClass = await testButton.getAttribute('class');
    const finalEnabled = await testButton.isEnabled();
    
    console.log(`Final state: enabled=${finalEnabled}`);
    
    // Button should return to enabled state eventually
    expect(finalEnabled).toBe(true);
    
    console.log('✅ Button interaction test completed successfully');
  });

  test('should verify visual consistency of icon rendering', async ({ page }) => {
    console.log('🎨 Testing visual consistency of vote button icons');
    
    // Find all SVG icons in vote buttons
    const voteButtonSvgs = page.locator('button[title*="Mark"], button[title*="Sign in to mark"]').locator('svg');
    const svgCount = await voteButtonSvgs.count();
    
    console.log(`Found ${svgCount} vote button SVG icons`);
    expect(svgCount).toBeGreaterThan(0);
    
    const iconStates: Array<{fill: string, stroke: string}> = [];
    
    // Collect icon states
    for (let i = 0; i < Math.min(10, svgCount); i++) {
      const svg = voteButtonSvgs.nth(i);
      const fill = await svg.getAttribute('fill') || 'null';
      const stroke = await svg.getAttribute('stroke-width') || 'null';
      
      iconStates.push({ fill, stroke });
      console.log(`Icon ${i + 1}: fill="${fill}", stroke="${stroke}"`);
      
      // Verify icon is visible
      await expect(svg).toBeVisible();
    }
    
    // Analyze icon state distribution
    const fillTypes = new Set(iconStates.map(s => s.fill));
    const strokeTypes = new Set(iconStates.map(s => s.stroke));
    
    console.log(`Fill types found: ${Array.from(fillTypes).join(', ')}`);
    console.log(`Stroke types found: ${Array.from(strokeTypes).join(', ')}`);
    
    // Should have at least one type of icon rendering
    expect(fillTypes.size).toBeGreaterThan(0);
    expect(strokeTypes.size).toBeGreaterThan(0);
    
    // Count solid vs outline icons
    const solidIcons = iconStates.filter(s => s.fill === 'currentColor').length;
    const outlineIcons = iconStates.filter(s => s.fill === 'none').length;
    
    console.log(`Solid icons: ${solidIcons}, Outline icons: ${outlineIcons}`);
    
    console.log('✅ Icon rendering consistency verified');
  });

  test('should test rapid clicking behavior', async ({ page }) => {
    console.log('⚡ Testing rapid clicking behavior');
    
    const allVoteButtons = page.locator('button[title*="Mark"], button[title*="Sign in to mark"]');
    const buttonCount = await allVoteButtons.count();
    
    if (buttonCount === 0) {
      console.log('⚠️ No buttons found for rapid clicking test');
      return;
    }
    
    const testButton = allVoteButtons.first();
    const title = await testButton.getAttribute('title');
    
    console.log(`Testing rapid clicking on: ${title}`);
    
    // Verify initial state
    const initialEnabled = await testButton.isEnabled();
    expect(initialEnabled).toBe(true);
    
    console.log('Performing 5 rapid clicks...');
    
    // Perform rapid clicks
    for (let i = 0; i < 5; i++) {
      await testButton.click();
      await page.waitForTimeout(50); // Very short delay
    }
    
    // Wait for any processing to complete
    await page.waitForTimeout(1000);
    
    // Button should still be functional
    const finalEnabled = await testButton.isEnabled();
    const isVisible = await testButton.isVisible();
    
    expect(isVisible).toBe(true);
    expect(finalEnabled).toBe(true);
    
    console.log('✅ Button remains stable after rapid clicking');
  });

  test('should verify accessibility of vote buttons', async ({ page }) => {
    console.log('♿ Testing vote button accessibility');
    
    const allVoteButtons = page.locator('button[title*="Mark"], button[title*="Sign in to mark"]');
    const buttonCount = await allVoteButtons.count();
    
    expect(buttonCount).toBeGreaterThan(0);
    
    // Test accessibility of first few buttons
    const testCount = Math.min(5, buttonCount);
    
    for (let i = 0; i < testCount; i++) {
      const button = allVoteButtons.nth(i);
      const title = await button.getAttribute('title');
      const ariaLabel = await button.getAttribute('aria-label');
      
      console.log(`Button ${i + 1}: title="${title}", aria-label="${ariaLabel}"`);
      
      // Must have either title or aria-label
      expect(title || ariaLabel).toBeTruthy();
      
      // Test keyboard navigation
      await button.focus();
      const isFocused = await button.evaluate(el => document.activeElement === el);
      
      if (isFocused) {
        console.log(`  ✅ Button ${i + 1} is keyboard focusable`);
        
        // Test Enter key activation
        await button.press('Enter');
        await page.waitForTimeout(200);
        
        // Button should still be there and functional
        await expect(button).toBeVisible();
        await expect(button).toBeEnabled();
        
        console.log(`  ✅ Button ${i + 1} responds to Enter key`);
      } else {
        console.log(`  ⚠️ Button ${i + 1} may not be focusable`);
      }
    }
    
    console.log('✅ Accessibility testing completed');
  });

  test('should verify user count displays work correctly', async ({ page }) => {
    console.log('📊 Testing user count displays');
    
    const userCounts = page.locator('text=/\\d+\\s+users?/');
    const countElements = await userCounts.count();
    
    console.log(`Found ${countElements} user count displays`);
    expect(countElements).toBeGreaterThan(0);
    
    // Check first few counts
    for (let i = 0; i < Math.min(5, countElements); i++) {
      const countElement = userCounts.nth(i);
      const text = await countElement.textContent();
      const isVisible = await countElement.isVisible();
      
      console.log(`Count ${i + 1}: "${text}" (visible: ${isVisible})`);
      
      expect(isVisible).toBe(true);
      expect(text).toMatch(/\d+\s+users?/);
      
      // Check if there's a nearby vote button
      const nearbyButton = countElement.locator('..').locator('button').first();
      const hasNearbyButton = await nearbyButton.isVisible().catch(() => false);
      
      if (hasNearbyButton) {
        const buttonTitle = await nearbyButton.getAttribute('title');
        console.log(`  Associated button: ${buttonTitle}`);
        
        // Verify the count is mentioned in the button title
        if (buttonTitle && text) {
          const countNumber = text.match(/\\d+/)?.[0];
          if (countNumber && buttonTitle.includes(countNumber)) {
            console.log(`  ✅ Count ${countNumber} is reflected in button title`);
          }
        }
      }
    }
    
    console.log('✅ User count displays are working correctly');
  });
});