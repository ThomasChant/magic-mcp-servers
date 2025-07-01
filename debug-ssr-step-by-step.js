import fs from "node:fs/promises";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

async function debugSSR() {
  try {
    console.log('=== DEBUGGING SSR STEP BY STEP ===');
    
    const testUrl = '/servers/InditexTech_mcp-teams-server';
    console.log(`Testing URL: ${testUrl}`);
    
    // Step 1: Test template reading
    console.log('\n--- Step 1: Reading template ---');
    const template = await fs.readFile('./index-ssr.html', 'utf-8');
    console.log('✅ Template read successfully');
    console.log('Template length:', template.length);
    console.log('Has <!--app-head-->:', template.includes('<!--app-head-->'));
    console.log('Has <!--app-html-->:', template.includes('<!--app-html-->'));
    
    // Step 2: Test SSR module import
    console.log('\n--- Step 2: Importing SSR module ---');
    const serverModule = await import('./dist/server/entry-server.js');
    console.log('✅ SSR module imported successfully');
    console.log('Render function exists:', typeof serverModule.render === 'function');
    
    // Step 3: Test SSR execution
    console.log('\n--- Step 3: Executing SSR ---');
    const result = await serverModule.render(testUrl);
    console.log('✅ SSR executed successfully');
    console.log('Result keys:', Object.keys(result));
    console.log('Has html:', typeof result.html === 'string' && result.html.length > 0);
    console.log('HTML length:', result.html?.length || 0);
    console.log('Has seoData:', !!result.seoData);
    console.log('Has serverData:', !!result.serverData);
    
    if (result.serverData) {
      console.log('Server name:', result.serverData.name);
    }
    
    if (result.seoData) {
      console.log('SEO title:', result.seoData.title);
    }
    
    // Step 4: Test HTML content
    console.log('\n--- Step 4: Analyzing rendered HTML ---');
    if (result.html) {
      console.log('HTML contains server data:', result.html.includes('ServerDetail') || result.html.includes('server'));
      console.log('HTML is not empty div:', !result.html.includes('<div class="min-h-screen "><div class="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-200">'));
      console.log('First 200 chars of HTML:', result.html.substring(0, 200));
    }
    
    // Step 5: Test replacements
    console.log('\n--- Step 5: Testing replacements ---');
    let finalHtml = template;
    
    if (result.seoData) {
      const dynamicHead = `<title>${result.seoData.title}</title>`;
      finalHtml = finalHtml.replace('<!--app-head-->', dynamicHead);
      console.log('✅ SEO replacement applied');
    }
    
    finalHtml = finalHtml.replace('<!--app-html-->', result.html || '');
    console.log('✅ HTML replacement applied');
    
    // Step 6: Verify final result
    console.log('\n--- Step 6: Verifying final result ---');
    console.log('Final HTML still has <!--app-head-->:', finalHtml.includes('<!--app-head-->'));
    console.log('Final HTML still has <!--app-html-->:', finalHtml.includes('<!--app-html-->'));
    console.log('Final HTML has dynamic title:', result.seoData ? finalHtml.includes(result.seoData.title) : false);
    console.log('Final HTML has rendered content:', finalHtml.includes('<div id="root">') && !finalHtml.includes('<div id="root"></div>'));
    
    // Step 7: Check if root div has content
    const rootMatch = finalHtml.match(/<div id="root">(.*?)<\/div>/s);
    if (rootMatch) {
      const rootContent = rootMatch[1];
      console.log('Root div has content:', rootContent.length > 0);
      console.log('Root content length:', rootContent.length);
      if (rootContent.length > 0) {
        console.log('Root content preview:', rootContent.substring(0, 100));
      }
    } else {
      console.log('❌ Could not find root div in final HTML');
    }
    
    console.log('\n=== DEBUG COMPLETE ===');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

debugSSR();