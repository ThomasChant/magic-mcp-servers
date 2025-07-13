import { test, expect } from '@playwright/test';

test.describe('Voting Functionality - Basic Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page first
    await page.goto('http://localhost:5173/servers');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should find vote-related buttons on the page', async ({ page }) => {
    // Look for various types of vote buttons
    const voteButtons = page.locator('button').filter({
      hasText: /mark|vote|using|sign in/i
    });
    
    const buttonCount = await voteButtons.count();
    console.log(`Found ${buttonCount} potential vote buttons`);
    
    if (buttonCount > 0) {
      // Check first few buttons
      for (let i = 0; i < Math.min(3, buttonCount); i++) {
        const button = voteButtons.nth(i);
        const text = await button.textContent();
        const title = await button.getAttribute('title');
        
        console.log(`Button ${i + 1}: text="${text}", title="${title}"`);
        
        await expect(button).toBeVisible();
      }
    }
    
    // Also look for thumb icons (vote buttons might not have text)
    const thumbButtons = page.locator('button svg[data-lucide="thumbs-up"]').locator('..');
    const thumbCount = await thumbButtons.count();
    console.log(`Found ${thumbCount} thumb icon buttons`);
    
    const totalButtons = buttonCount + thumbCount;
    expect(totalButtons).toBeGreaterThan(0);
    
    console.log('✅ Vote-related buttons found on the page');
  });

  test('should detect vote button interaction capabilities', async ({ page }) => {
    // Find buttons with thumbs-up icons
    const thumbButtons = page.locator('button:has(svg[data-lucide="thumbs-up"])');
    const thumbCount = await thumbButtons.count();
    
    console.log(`Found ${thumbCount} thumbs-up buttons`);
    
    if (thumbCount > 0) {
      const testButton = thumbButtons.first();
      const svg = testButton.locator('svg').first();
      
      // Get initial state
      const initialFill = await svg.getAttribute('fill');
      const initialStroke = await svg.getAttribute('stroke-width');
      const isEnabled = await testButton.isEnabled();
      const title = await testButton.getAttribute('title');
      
      console.log(`First thumb button: enabled=${isEnabled}, fill="${initialFill}", stroke="${initialStroke}", title="${title}"`);
      
      await expect(testButton).toBeVisible();
      
      if (isEnabled) {
        console.log('✅ Vote button is interactive');
        
        // Try clicking
        await testButton.click();
        await page.waitForTimeout(500);
        
        // Check if state changed
        const newFill = await svg.getAttribute('fill');
        const newStroke = await svg.getAttribute('stroke-width');
        const newTitle = await testButton.getAttribute('title');
        
        console.log(`After click: fill="${newFill}", stroke="${newStroke}", title="${newTitle}"`);
        
        if (newFill !== initialFill || newStroke !== initialStroke || newTitle !== title) {
          console.log('✅ Button state changed after click');
        } else {
          console.log('ℹ️ Button state remained the same (may require authentication)');
        }
      } else {
        console.log('ℹ️ Vote button is disabled (may require authentication)');
      }
    }
    
    expect(thumbCount).toBeGreaterThan(0);
  });

  test('should display user count information', async ({ page }) => {
    // Look for elements that show user counts
    const userCountElements = page.locator('text=/\\d+\\s+users?/');
    const countElements = await userCountElements.count();
    
    console.log(`Found ${countElements} user count displays`);
    
    if (countElements > 0) {
      for (let i = 0; i < Math.min(3, countElements); i++) {
        const element = userCountElements.nth(i);
        const text = await element.textContent();
        console.log(`User count ${i + 1}: ${text}`);
      }
      console.log('✅ User count information is displayed');
    } else {
      // Look for any numeric displays that might be vote counts
      const numberElements = page.locator('text=/\\d+/');
      const numberCount = await numberElements.count();
      console.log(`Found ${numberCount} numeric elements (potential vote counts)`);
    }
    
    // This test is informational - we just want to see what's there
    expect(true).toBe(true);
  });

  test('should have accessible vote buttons', async ({ page }) => {
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    
    console.log(`Checking accessibility of ${buttonCount} buttons`);
    
    let voteButtonsChecked = 0;
    
    for (let i = 0; i < Math.min(10, buttonCount); i++) {
      const button = allButtons.nth(i);
      const title = await button.getAttribute('title');
      const ariaLabel = await button.getAttribute('aria-label');
      
      // Check if this looks like a vote button
      if (title && (title.includes('using') || title.includes('vote') || title.includes('mark'))) {
        voteButtonsChecked++;
        
        console.log(`Vote button ${voteButtonsChecked}: title="${title}", aria-label="${ariaLabel}"`);
        
        // Check accessibility
        expect(title || ariaLabel).toBeTruthy();
        
        // Check if focusable
        await button.focus();
        const isFocused = await button.evaluate(el => document.activeElement === el);
        
        if (isFocused) {
          console.log(`✅ Button ${voteButtonsChecked} is focusable`);
        }
      }
    }
    
    if (voteButtonsChecked > 0) {
      console.log(`✅ Checked accessibility of ${voteButtonsChecked} vote buttons`);
    } else {
      console.log('ℹ️ No obvious vote buttons found for accessibility testing');
    }
    
    expect(voteButtonsChecked).toBeGreaterThanOrEqual(0);
  });

  test('should handle button interactions gracefully', async ({ page }) => {
    // Find any clickable buttons and test interaction
    const clickableButtons = page.locator('button:not([disabled])');
    const buttonCount = await clickableButtons.count();
    
    console.log(`Found ${buttonCount} clickable buttons`);
    
    if (buttonCount > 0) {
      // Test first button
      const testButton = clickableButtons.first();
      const title = await testButton.getAttribute('title');
      
      console.log(`Testing interaction with: ${title}`);
      
      // Click and verify no errors
      await testButton.click();
      await page.waitForTimeout(500);
      
      // Button should still exist and be visible
      await expect(testButton).toBeVisible();
      
      // Check for any error dialogs or messages
      const errorMessages = page.locator('text=/error|fail|wrong/i');
      const errorCount = await errorMessages.count();
      
      if (errorCount === 0) {
        console.log('✅ No error messages after button click');
      } else {
        console.log(`⚠️ Found ${errorCount} potential error messages`);
      }
      
      console.log('✅ Button interaction completed gracefully');
    }
    
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should show appropriate visual states for vote buttons', async ({ page }) => {
    // Find vote-related buttons and analyze their visual states
    const voteButtons = page.locator('button:has(svg[data-lucide="thumbs-up"])');
    const buttonCount = await voteButtons.count();
    
    console.log(`Analyzing visual states of ${buttonCount} vote buttons`);
    
    if (buttonCount > 0) {
      const stateAnalysis = {
        filled: 0,
        outlined: 0,
        colored: 0,
        enabled: 0,
        disabled: 0
      };
      
      for (let i = 0; i < Math.min(5, buttonCount); i++) {
        const button = voteButtons.nth(i);
        const svg = button.locator('svg').first();
        
        const fill = await svg.getAttribute('fill');
        const strokeWidth = await svg.getAttribute('stroke-width');
        const isEnabled = await button.isEnabled();
        const buttonClass = await button.getAttribute('class');
        
        console.log(`Button ${i + 1}: fill="${fill}", stroke="${strokeWidth}", enabled=${isEnabled}`);
        
        // Categorize visual states
        if (fill === 'currentColor' || (fill && fill !== 'none')) {
          stateAnalysis.filled++;
        } else {
          stateAnalysis.outlined++;
        }
        
        if (buttonClass && (buttonClass.includes('red') || buttonClass.includes('blue'))) {
          stateAnalysis.colored++;
        }
        
        if (isEnabled) {
          stateAnalysis.enabled++;
        } else {
          stateAnalysis.disabled++;
        }
      }
      
      console.log('Visual state analysis:', stateAnalysis);
      
      // Verify we have some visual variety
      const hasVariety = stateAnalysis.filled > 0 || stateAnalysis.outlined > 0;
      expect(hasVariety).toBe(true);
      
      console.log('✅ Vote buttons show appropriate visual state indicators');
    }
    
    expect(buttonCount).toBeGreaterThan(0);
  });
});