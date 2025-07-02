import fs from 'fs/promises';

async function testTemplateLogic() {
  try {
    console.log('Testing template logic...');
    
    // Test 1: Can we read the template?
    const template = await fs.readFile('./dist/client/index-ssr.html', 'utf-8');
    console.log('✅ Template read successfully, length:', template.length);
    
    // Test 2: Does template contain placeholders?
    const hasAppHead = template.includes('<!--app-head-->');
    const hasAppHtml = template.includes('<!--app-html-->');
    console.log('✅ Has <!--app-head-->:', hasAppHead);
    console.log('✅ Has <!--app-html-->:', hasAppHtml);
    
    // Test 3: Can we import and call SSR?
    const serverModule = await import('../dist/server/entry-server.js');
    const { html: renderedHtml, seoData } = await serverModule.render('/servers/InditexTech_mcp-teams-server');
    console.log('✅ SSR executed, html length:', renderedHtml.length);
    console.log('✅ SEO data generated:', !!seoData);
    
    // Test 4: Can we do the replacements?
    let finalHtml = template;
    
    if (seoData) {
      const dynamicHead = `
    <title>${seoData.title}</title>
    <meta name="description" content="${seoData.description}" />`;
      
      finalHtml = finalHtml.replace('<!--app-head-->', dynamicHead);
      console.log('✅ SEO replacement done');
    }
    
    finalHtml = finalHtml.replace('<!--app-html-->', renderedHtml);
    console.log('✅ HTML replacement done');
    
    // Test 5: Check final result
    const finalHasAppHead = finalHtml.includes('<!--app-head-->');
    const finalHasAppHtml = finalHtml.includes('<!--app-html-->');
    const hasDynamicTitle = finalHtml.includes(seoData.title);
    
    console.log('✅ Final template still has <!--app-head-->:', finalHasAppHead);
    console.log('✅ Final template still has <!--app-html-->:', finalHasAppHtml);
    console.log('✅ Final template has dynamic title:', hasDynamicTitle);
    
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

testTemplateLogic();