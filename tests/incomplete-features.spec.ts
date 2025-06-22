import { test, expect } from '@playwright/test';

let incompleteFeatures: string[] = [];

test.describe('MCP Hub Feature Completeness Analysis', () => {
  test.beforeEach(async ({ page }) => {
    incompleteFeatures = [];
  });

  test('Home page functionality check', async ({ page }) => {
    await page.goto('/');
    
    // Check if page loads
    await expect(page).toHaveTitle(/MCP Hub/);
    
    // Check search functionality
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="搜索"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      // Check if search results update
      await page.waitForTimeout(1000);
      const hasResults = await page.locator('[data-testid*="result"], .search-result, .server-card').count() > 0;
      if (!hasResults) {
        incompleteFeatures.push('Home page - Search functionality not working properly');
      }
    } else {
      incompleteFeatures.push('Home page - Search input not found');
    }

    // Check navigation links
    const navLinks = page.locator('nav a, header a');
    const linkCount = await navLinks.count();
    if (linkCount === 0) {
      incompleteFeatures.push('Home page - Navigation links missing');
    }

    // Check server cards/listings
    const serverCards = page.locator('.server-card, [data-testid*="server"], .card');
    const cardCount = await serverCards.count();
    if (cardCount === 0) {
      incompleteFeatures.push('Home page - Server listings not displayed');
    }

    // Check for loading states
    const loadingIndicators = page.locator('[data-testid*="loading"], .loading, .spinner');
    const hasLoadingStates = await loadingIndicators.count() > 0;
    if (!hasLoadingStates) {
      incompleteFeatures.push('Home page - Loading states missing');
    }
  });

  test('Servers page functionality check', async ({ page }) => {
    await page.goto('/servers');
    
    // Check if page loads
    await page.waitForLoadState('networkidle');
    
    // Check filters
    const filters = page.locator('select, input[type="checkbox"], .filter, [data-testid*="filter"]');
    const filterCount = await filters.count();
    if (filterCount === 0) {
      incompleteFeatures.push('Servers page - Filter controls missing');
    }

    // Check sorting options
    const sortOptions = page.locator('select[data-testid*="sort"], .sort-dropdown, [aria-label*="sort"]');
    const hasSorting = await sortOptions.count() > 0;
    if (!hasSorting) {
      incompleteFeatures.push('Servers page - Sorting functionality missing');
    }

    // Check pagination or infinite scroll
    const pagination = page.locator('.pagination, [data-testid*="pagination"], button[aria-label*="next"]');
    const loadMore = page.locator('button[data-testid*="load"], .load-more');
    const hasPagination = await pagination.count() > 0 || await loadMore.count() > 0;
    if (!hasPagination) {
      incompleteFeatures.push('Servers page - Pagination or load more functionality missing');
    }
  });

  test('Categories page functionality check', async ({ page }) => {
    await page.goto('/categories');
    
    await page.waitForLoadState('networkidle');
    
    // Check category listings
    const categories = page.locator('.category, [data-testid*="category"], .card');
    const categoryCount = await categories.count();
    if (categoryCount === 0) {
      incompleteFeatures.push('Categories page - Category listings not displayed');
    }

    // Check category navigation
    if (categoryCount > 0) {
      await categories.first().click();
      await page.waitForTimeout(1000);
      const url = page.url();
      if (!url.includes('category') && !url.includes('servers')) {
        incompleteFeatures.push('Categories page - Category navigation not working');
      }
    }
  });

  test('Server detail page functionality check', async ({ page }) => {
    // Try to visit a server detail page
    await page.goto('/servers');
    await page.waitForLoadState('networkidle');
    
    const serverLinks = page.locator('a[href*="/server/"], .server-card a, [data-testid*="server"] a');
    const linkCount = await serverLinks.count();
    
    if (linkCount > 0) {
      await serverLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      // Check server details
      const serverTitle = page.locator('h1, .server-title, [data-testid*="title"]');
      const hasTitle = await serverTitle.count() > 0;
      if (!hasTitle) {
        incompleteFeatures.push('Server detail page - Server title missing');
      }

      // Check installation instructions
      const installInstructions = page.locator('.install, [data-testid*="install"], code');
      const hasInstructions = await installInstructions.count() > 0;
      if (!hasInstructions) {
        incompleteFeatures.push('Server detail page - Installation instructions missing');
      }

      // Check documentation links
      const docLinks = page.locator('a[href*="github"], a[href*="doc"], .documentation');
      const hasDocLinks = await docLinks.count() > 0;
      if (!hasDocLinks) {
        incompleteFeatures.push('Server detail page - Documentation links missing');
      }
    } else {
      incompleteFeatures.push('Server detail pages - No server detail links found');
    }
  });

  test('Search functionality comprehensive check', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="搜索"]');
    if (await searchInput.count() > 0) {
      // Test search with different terms
      await searchInput.fill('database');
      await page.waitForTimeout(1000);
      
      // Check search results
      const results = page.locator('.search-result, .server-card, [data-testid*="result"]');
      const resultCount = await results.count();
      
      if (resultCount === 0) {
        incompleteFeatures.push('Search - No results displayed for valid search term');
      }

      // Test empty search
      await searchInput.fill('');
      await page.waitForTimeout(1000);
      const allServers = await page.locator('.server-card, [data-testid*="server"]').count();
      if (allServers === 0) {
        incompleteFeatures.push('Search - Empty search does not show all servers');
      }

      // Test no results case
      await searchInput.fill('zzzznonexistent');
      await page.waitForTimeout(1000);
      const noResults = await page.locator('.no-results, [data-testid*="no-results"]').count();
      if (noResults === 0) {
        incompleteFeatures.push('Search - No results message missing');
      }
    }
  });

  test('Theme and language switching', async ({ page }) => {
    await page.goto('/');
    
    // Check theme toggle
    const themeToggle = page.locator('button[data-testid*="theme"], .theme-toggle, [aria-label*="theme"]');
    const hasThemeToggle = await themeToggle.count() > 0;
    if (!hasThemeToggle) {
      incompleteFeatures.push('UI - Theme toggle missing');
    }

    // Check language selector
    const langSelector = page.locator('select[data-testid*="lang"], .language-selector, [aria-label*="language"]');
    const hasLangSelector = await langSelector.count() > 0;
    if (!hasLangSelector) {
      incompleteFeatures.push('UI - Language selector missing');
    }
  });

  test('Mobile responsiveness check', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check mobile menu
    const mobileMenu = page.locator('.mobile-menu, [data-testid*="mobile"], .hamburger');
    const hasMobileMenu = await mobileMenu.count() > 0;
    if (!hasMobileMenu) {
      incompleteFeatures.push('Mobile - Mobile menu missing');
    }

    // Check if content is properly responsive
    const overflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    if (overflow) {
      incompleteFeatures.push('Mobile - Horizontal scroll detected (responsiveness issue)');
    }
  });

  test('Error handling check', async ({ page }) => {
    // Test 404 page
    await page.goto('/nonexistent-page');
    const has404 = await page.locator('h1, .error, [data-testid*="error"]').count() > 0;
    if (!has404) {
      incompleteFeatures.push('Error handling - 404 page missing');
    }

    // Test error boundaries (simulate error)
    await page.goto('/');
    const errorBoundary = page.locator('.error-boundary, [data-testid*="error-boundary"]');
    const hasErrorBoundary = await errorBoundary.count() > 0;
    // Note: This is hard to test without actually triggering an error
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (incompleteFeatures.length > 0) {
      console.log(`Test: ${testInfo.title}`);
      console.log('Incomplete features found:', incompleteFeatures);
    }
  });

  test('Write findings to todo.md', async ({ page }) => {
    // Collect all findings and write to file
    const fs = require('fs');
    const path = require('path');
    
    const todoPath = path.join(process.cwd(), 'todo.md');
    let content = '# TODO - Incomplete Features Found by Playwright Analysis\n\n';
    content += `Generated on: ${new Date().toISOString()}\n\n`;
    
    if (incompleteFeatures.length === 0) {
      content += '## ✅ All tested features appear to be working\n\n';
      content += 'No incomplete features were detected during the automated testing.\n';
    } else {
      content += '## 🔍 Incomplete Features Detected\n\n';
      incompleteFeatures.forEach((feature, index) => {
        content += `${index + 1}. ${feature}\n`;
      });
    }
    
    content += '\n## 📋 Additional Manual Testing Recommended\n\n';
    content += '- API error handling and edge cases\n';
    content += '- Performance under heavy load\n';
    content += '- Accessibility compliance (WCAG)\n';
    content += '- Cross-browser compatibility\n';
    content += '- Keyboard navigation\n';
    content += '- Screen reader compatibility\n';
    content += '- Data validation and sanitization\n';
    content += '- Security headers and CSP\n';
    content += '- Progressive Web App features\n';
    content += '- Offline functionality\n';
    
    fs.writeFileSync(todoPath, content);
  });
});