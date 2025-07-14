import { test, expect } from '@playwright/test';

test.describe('Canonical URL Tests', () => {
  test.describe('Home Page', () => {
    test('English home page should have canonical URL pointing to itself', async ({ page }) => {
      await page.goto('/');
      const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonicalUrl).toBe('https://magicmcp.net/');
    });

    test('Japanese home page should have canonical URL pointing to itself', async ({ page }) => {
      await page.goto('/ja');
      const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonicalUrl).toBe('https://magicmcp.net/ja');
    });

    test('Chinese home page should have canonical URL pointing to itself', async ({ page }) => {
      await page.goto('/zh-CN');
      const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonicalUrl).toBe('https://magicmcp.net/zh-CN');
    });
  });

  test.describe('Servers List Page', () => {
    test('English servers page should have canonical URL pointing to itself', async ({ page }) => {
      await page.goto('/servers');
      const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonicalUrl).toBe('https://magicmcp.net/servers');
    });

    test('Japanese servers page should have canonical URL pointing to itself', async ({ page }) => {
      await page.goto('/ja/servers');
      const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonicalUrl).toBe('https://magicmcp.net/ja/servers');
    });

    test('Chinese servers page should have canonical URL pointing to itself', async ({ page }) => {
      await page.goto('/zh-CN/servers');
      const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonicalUrl).toBe('https://magicmcp.net/zh-CN/servers');
    });
  });

  test.describe('Server Detail Page', () => {
    const testServerId = 'manusa_kubernetes-mcp-server';
    
    test('English server detail page should have canonical URL pointing to itself', async ({ page }) => {
      await page.goto(`/servers/${testServerId}`);
      const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonicalUrl).toBe(`https://magicmcp.net/servers/${testServerId}`);
    });

    test('Japanese server detail page should have canonical URL pointing to itself', async ({ page }) => {
      await page.goto(`/ja/servers/${testServerId}`);
      const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonicalUrl).toBe(`https://magicmcp.net/ja/servers/${testServerId}`);
    });

    test('Chinese server detail page should have canonical URL pointing to itself', async ({ page }) => {
      await page.goto(`/zh-CN/servers/${testServerId}`);
      const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonicalUrl).toBe(`https://magicmcp.net/zh-CN/servers/${testServerId}`);
    });

    test('French server detail page should have canonical URL pointing to itself', async ({ page }) => {
      await page.goto(`/fr/servers/${testServerId}`);
      const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonicalUrl).toBe(`https://magicmcp.net/fr/servers/${testServerId}`);
    });

    test('Korean server detail page should have canonical URL pointing to itself', async ({ page }) => {
      await page.goto(`/ko/servers/${testServerId}`);
      const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonicalUrl).toBe(`https://magicmcp.net/ko/servers/${testServerId}`);
    });
  });

  test.describe('Categories Page', () => {
    test('English categories page should have canonical URL pointing to itself', async ({ page }) => {
      await page.goto('/categories');
      const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonicalUrl).toBe('https://magicmcp.net/categories');
    });

    test('Japanese categories page should have canonical URL pointing to itself', async ({ page }) => {
      await page.goto('/ja/categories');
      const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonicalUrl).toBe('https://magicmcp.net/ja/categories');
    });
  });

  test.describe('Category Detail Page', () => {
    const testCategoryId = 'databases';
    
    test('English category detail page should have canonical URL pointing to itself', async ({ page }) => {
      await page.goto(`/categories/${testCategoryId}`);
      const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonicalUrl).toBe(`https://magicmcp.net/categories/${testCategoryId}`);
    });

    test('Japanese category detail page should have canonical URL pointing to itself', async ({ page }) => {
      await page.goto(`/ja/categories/${testCategoryId}`);
      const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonicalUrl).toBe(`https://magicmcp.net/ja/categories/${testCategoryId}`);
    });
  });

  test.describe('Hreflang Tags', () => {
    test('Server detail page should have correct hreflang tags', async ({ page }) => {
      const testServerId = 'manusa_kubernetes-mcp-server';
      await page.goto(`/servers/${testServerId}`);
      
      // Check that hreflang tags exist for all supported languages
      const supportedLocales = ['en', 'zh-CN', 'zh-TW', 'fr', 'ja', 'ko', 'ru'];
      
      for (const locale of supportedLocales) {
        const expectedHref = locale === 'en' 
          ? `https://magicmcp.net/servers/${testServerId}`
          : `https://magicmcp.net/${locale}/servers/${testServerId}`;
        
        const hreflangTag = await page.locator(`link[rel="alternate"][hreflang="${locale}"]`).getAttribute('href');
        expect(hreflangTag).toBe(expectedHref);
      }
      
      // Check x-default hreflang
      const xDefaultTag = await page.locator('link[rel="alternate"][hreflang="x-default"]').getAttribute('href');
      expect(xDefaultTag).toBe(`https://magicmcp.net/servers/${testServerId}`);
    });
  });

  test.describe('Docs Page', () => {
    test('English docs page should have canonical URL pointing to itself', async ({ page }) => {
      await page.goto('/docs');
      const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonicalUrl).toBe('https://magicmcp.net/docs');
    });

    test('Japanese docs page should have canonical URL pointing to itself', async ({ page }) => {
      await page.goto('/ja/docs');
      const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonicalUrl).toBe('https://magicmcp.net/ja/docs');
    });
  });
});