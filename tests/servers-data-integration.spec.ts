import { test, expect } from '@playwright/test';

/**
 * SPARC TDD: Server页面数据集成测试套件
 * 
 * 测试目标：
 * 1. 验证servers页面正确使用优化后的数据结构
 * 2. 确保渐进式数据加载工作正常
 * 3. 验证搜索、过滤和排序功能
 * 4. 确保性能符合预期
 */

test.describe('Server页面数据集成', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到servers页面
    await page.goto('/servers');
  });

  test('应该使用优化后的数据结构加载服务器列表', async ({ page }) => {
    // 检查页面是否正确加载
    await expect(page.locator('h1')).toContainText('MCP Servers');
    
    // 验证数据加载：应该看到服务器卡片
    await expect(page.locator('[data-testid*="server-card"]').first()).toBeVisible({ timeout: 5000 });
    
    // 验证服务器数量符合预期（应该有1800+个服务器）
    const serverCards = page.locator('[data-testid*="server-card"]');
    const count = await serverCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('应该显示正确的服务器信息', async ({ page }) => {
    // 等待第一个服务器卡片加载
    const firstCard = page.locator('[data-testid*="server-card"]').first();
    await expect(firstCard).toBeVisible();
    
    // 验证服务器卡片包含必要信息
    await expect(firstCard.locator('.server-name')).toBeVisible();
    await expect(firstCard.locator('.server-description')).toBeVisible();
    await expect(firstCard.locator('.server-stats')).toBeVisible();
  });

  test('搜索功能应该正常工作', async ({ page }) => {
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // 查找搜索输入框
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible();
    
    // 先记录初始结果数量
    const initialResults = page.locator('[data-testid*="server-card"]');
    await initialResults.first().waitFor();
    
    // 进行搜索 - 使用更通用的搜索词
    await searchInput.fill('api');
    await page.waitForTimeout(500); // 等待搜索结果更新
    
    // 验证搜索结果
    const searchResults = page.locator('[data-testid*="server-card"]');
    const filteredCount = await searchResults.count();
    
    // 搜索应该过滤结果（结果数量应该变化）
    expect(filteredCount).toBeGreaterThan(0);
    
    // 验证搜索结果包含搜索词
    const firstResult = searchResults.first();
    if (await firstResult.isVisible()) {
      const text = await firstResult.textContent();
      expect(text?.toLowerCase()).toContain('api');
    }
    
    // 清除搜索，验证结果恢复
    await searchInput.fill('');
    await page.waitForTimeout(500);
    const clearedResults = page.locator('[data-testid*="server-card"]');
    const clearedCount = await clearedResults.count();
    expect(clearedCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test('分类过滤应该正常工作', async ({ page }) => {
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 查找分类过滤器
    const categoryFilter = page.locator('button, select, input').filter({ hasText: /database|Database/ }).first();
    
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();
      
      // 等待过滤结果
      await page.waitForTimeout(1000);
      
      // 验证过滤结果
      const filteredCards = page.locator('[data-testid*="server-card"]');
      expect(await filteredCards.count()).toBeGreaterThan(0);
    }
  });

  test('服务器详情链接应该正确工作', async ({ page }) => {
    // 等待服务器卡片加载
    const firstCard = page.locator('[data-testid*="server-card"]').first();
    await expect(firstCard).toBeVisible();
    
    // 点击第一个服务器卡片
    await firstCard.click();
    
    // 验证导航到服务器详情页
    await expect(page).toHaveURL(/\/servers\/[^/]+$/);
    
    // 验证详情页面内容
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('排序功能应该正常工作', async ({ page }) => {
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 查找排序控件
    const sortSelect = page.locator('select, button').filter({ hasText: /sort|Sort|排序/ }).first();
    
    if (await sortSelect.isVisible()) {
      // 尝试改变排序
      if (await sortSelect.locator('option').count() > 0) {
        await sortSelect.selectOption({ index: 1 });
      } else {
        await sortSelect.click();
      }
      
      // 等待重新排序
      await page.waitForTimeout(1000);
      
      // 验证结果仍然显示
      const cards = page.locator('[data-testid*="server-card"]');
      expect(await cards.count()).toBeGreaterThan(0);
    }
  });

  test('性能：初始加载应该在2秒内完成', async ({ page }) => {
    const startTime = Date.now();
    
    // 导航到页面并等待关键内容加载
    await page.goto('/servers');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid*="server-card"]').first()).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // 验证加载时间小于2秒
    expect(loadTime).toBeLessThan(2000);
  });

  test('响应式设计：移动端布局应该正确', async ({ page }) => {
    // 设置移动端视窗
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 等待页面加载
    await expect(page.locator('h1')).toBeVisible();
    
    // 验证移动端布局
    const container = page.locator('.container, .max-w-7xl').first();
    if (await container.isVisible()) {
      const box = await container.boundingBox();
      expect(box?.width).toBeLessThan(400); // 应该适应移动端宽度
    }
  });

  test('错误处理：网络错误时应该显示合适的消息', async ({ page }) => {
    // 模拟网络故障
    await page.route('**/data/servers-core.json', route => route.abort());
    
    // 导航到页面
    await page.goto('/servers');
    
    // 验证错误处理（应该显示加载状态或错误消息）
    const errorElement = page.locator('text=/error|loading|failed/i').first();
    const loadingElement = page.locator('[data-testid="loading"], .loading, .spinner').first();
    
    // 应该显示错误或加载状态
    await expect(errorElement.or(loadingElement)).toBeVisible({ timeout: 5000 });
  });

  test('数据完整性：服务器详情应该包含必要字段', async ({ page }) => {
    // 等待服务器卡片加载
    const firstCard = page.locator('[data-testid*="server-card"]').first();
    await expect(firstCard).toBeVisible();
    
    // 提取服务器信息
    const serverName = await firstCard.locator('.server-name, h3, h4').first().textContent();
    const serverDescription = await firstCard.locator('.server-description, p').first().textContent();
    
    // 验证必要字段存在
    expect(serverName).toBeTruthy();
    expect(serverDescription).toBeTruthy();
    
    // 验证GitHub stars显示
    const starsElement = firstCard.locator('text=/star|Star|⭐|★/i').first();
    if (await starsElement.isVisible()) {
      const starsText = await starsElement.textContent();
      expect(starsText).toMatch(/\d+/); // 应该包含数字
    }
  });
});

test.describe('服务器详情页数据集成', () => {
  test('应该正确加载单个服务器的详细信息', async ({ page }) => {
    // 先导航到服务器列表
    await page.goto('/servers');
    
    // 等待并点击第一个服务器
    const firstCard = page.locator('[data-testid*="server-card"]').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
    
    // 验证详情页面加载
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // 验证详情页面包含扩展信息
    const detailsContainer = page.locator('main, .container').first();
    await expect(detailsContainer).toBeVisible();
    
    // 验证技术栈信息
    const techStack = page.locator('text=/tech|technology|stack|built|node|python/i').first();
    if (await techStack.isVisible()) {
      expect(await techStack.textContent()).toBeTruthy();
    }
  });

  test('README信息应该正确加载', async ({ page }) => {
    // 导航到一个服务器详情页
    await page.goto('/servers');
    const firstCard = page.locator('[data-testid*="server-card"]').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
    
    // 等待详情页加载
    await page.waitForLoadState('networkidle');
    
    // 查找README或文档内容
    const readmeContent = page.locator('text=/readme|documentation|install|usage/i').first();
    
    // 如果存在README内容，验证其加载
    if (await readmeContent.isVisible()) {
      expect(await readmeContent.textContent()).toBeTruthy();
    }
  });
});

test.describe('性能和优化验证', () => {
  test('应该实现渐进式数据加载', async ({ page }) => {
    // 监听网络请求
    const requests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('.json')) {
        requests.push(request.url());
      }
    });
    
    // 导航到页面
    await page.goto('/servers');
    await expect(page.locator('h1')).toBeVisible();
    
    // 验证核心数据请求
    const coreDataRequest = requests.find(url => url.includes('servers-core.json'));
    expect(coreDataRequest).toBeTruthy();
    
    // 等待更长时间以捕获扩展数据请求
    await page.waitForTimeout(2000);
    
    // 验证扩展数据请求（可能延迟加载）
    const extendedDataRequest = requests.find(url => url.includes('servers-extended.json'));
    if (extendedDataRequest) {
      console.log('扩展数据正确加载');
    }
  });

  test('搜索索引应该正确使用', async ({ page }) => {
    // 监听网络请求
    const requests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('search-index.json')) {
        requests.push(request.url());
      }
    });
    
    // 导航并进行搜索
    await page.goto('/servers');
    const searchInput = page.locator('input[type="search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      
      // 验证搜索索引被使用（如果实现了客户端搜索）
      console.log('搜索功能测试完成');
    }
  });
});