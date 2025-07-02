async function testImport() {
  try {
    console.log('Testing server module import...');
    const serverModule = await import("../dist/server/entry-server.js");
    console.log('✅ Server module imported successfully');
    
    console.log('Testing render function...');
    const result = await serverModule.render('/servers/InditexTech_mcp-teams-server');
    console.log('✅ Render function executed successfully');
    
    console.log('Checking result structure...');
    console.log('Has html:', typeof result.html === 'string' && result.html.length > 0);
    console.log('Has seoData:', !!result.seoData);
    console.log('Has serverData:', !!result.serverData);
    
    if (result.seoData) {
      console.log('SEO Title:', result.seoData.title);
    }
    
  } catch (error) {
    console.error('❌ Import/render failed:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

testImport();