import fs from "node:fs/promises";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

async function testCompleteSSR() {
  try {
    console.log('=== FINAL COMPLETE SSR TEST ===');
    
    const testUrl = '/servers/InditexTech_mcp-teams-server';
    console.log(`Testing URL: ${testUrl}`);
    
    // Step 1: Execute SSR
    console.log('\n1. Executing SSR...');
    const serverModule = await import('./dist/server/entry-server.js');
    const result = await serverModule.render(testUrl);
    
    console.log(`✅ SSR completed`);
    console.log(`   - HTML length: ${result.html?.length || 0}`);
    console.log(`   - Has SEO data: ${!!result.seoData}`);
    console.log(`   - Has server data: ${!!result.serverData}`);
    
    if (result.seoData) {
      console.log(`   - SEO title: ${result.seoData.title}`);
    }
    
    if (result.serverData) {
      console.log(`   - Server name: ${result.serverData.name}`);
    }
    
    // Step 2: Read and prepare template
    console.log('\n2. Preparing template...');
    let template = await fs.readFile('./index-ssr.html', 'utf-8');
    console.log(`✅ Template read, length: ${template.length}`);
    
    // Update asset paths for production
    template = template.replace(
      'src="/src/entry-client.tsx"', 
      'type="module" crossorigin src="/assets/client-ssr-C7Wy1hAj.js"'
    );
    
    // Add CSS
    template = template.replace(
      '</head>',
      '    <link rel="stylesheet" crossorigin href="/assets/index-Cw0W-wPH.css">\n  </head>'
    );
    
    console.log(`✅ Asset paths updated`);
    
    // Step 3: Apply SEO
    console.log('\n3. Applying SEO...');
    if (result.seoData) {
      const seoHead = `<title>${result.seoData.title}</title>
    <meta name="description" content="${result.seoData.description}" />`;
      template = template.replace('<!--app-head-->', seoHead);
      console.log(`✅ SEO injected: ${result.seoData.title}`);
    } else {
      template = template.replace('<!--app-head-->', '');
      console.log(`⚠️  No SEO data to inject`);
    }
    
    // Step 4: Apply HTML content
    console.log('\n4. Applying HTML content...');
    const beforeLength = template.length;
    const placeholder = '<!--app-html-->';
    const htmlContent = result.html || '';
    
    console.log(`   - Template has placeholder: ${template.includes(placeholder)}`);
    console.log(`   - HTML content to inject: ${htmlContent.length} chars`);
    
    template = template.replace(placeholder, htmlContent);
    const afterLength = template.length;
    
    console.log(`✅ HTML injection completed`);
    console.log(`   - Template length before: ${beforeLength}`);
    console.log(`   - Template length after: ${afterLength}`);
    console.log(`   - Content added: ${afterLength - beforeLength}`);
    
    // Step 5: Verify final result
    console.log('\n5. Verifying final result...');
    
    const hasEmptyRoot = template.includes('<div id="root"></div>');
    const hasContentRoot = template.includes('<div id="root">') && !hasEmptyRoot;
    const stillHasPlaceholder = template.includes('<!--app-html-->');
    
    console.log(`   - Still has placeholder: ${stillHasPlaceholder}`);
    console.log(`   - Has empty root div: ${hasEmptyRoot}`);
    console.log(`   - Has content in root div: ${hasContentRoot}`);
    
    // Find the actual root div content
    const rootRegex = /<div id="root">(.*?)<\/div>/s;
    const rootMatch = template.match(rootRegex);
    
    if (rootMatch) {
      const rootContent = rootMatch[1];
      console.log(`   - Root content length: ${rootContent.length}`);
      console.log(`   - Root content preview: ${rootContent.substring(0, 150)}...`);
    } else {
      console.log(`   - ❌ Could not find root div in template`);
    }
    
    // Step 6: Write output file for inspection
    console.log('\n6. Writing output file...');
    await fs.writeFile('./ssr-test-output.html', template);
    console.log(`✅ Output written to ssr-test-output.html`);
    
    // Step 7: Summary
    console.log('\n=== SUMMARY ===');
    console.log(`✅ SSR execution: SUCCESS`);
    console.log(`✅ Template reading: SUCCESS`);
    console.log(`✅ Asset path updates: SUCCESS`);
    console.log(`${result.seoData ? '✅' : '⚠️'} SEO injection: ${result.seoData ? 'SUCCESS' : 'NO DATA'}`);
    console.log(`✅ HTML injection: SUCCESS`);
    console.log(`${hasContentRoot ? '✅' : '❌'} Final result: ${hasContentRoot ? 'ROOT HAS CONTENT' : 'ROOT IS EMPTY'}`);
    
    if (!hasContentRoot) {
      console.log('\n❌ PROBLEM IDENTIFIED: Root div is still empty after injection');
      console.log('This means the HTML replacement is not working correctly.');
    } else {
      console.log('\n🎉 SUCCESS: SSR is working correctly!');
    }
    
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error('Stack:', error.stack);
  }
}

testCompleteSSR();