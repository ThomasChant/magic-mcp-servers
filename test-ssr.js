import { render } from './dist/server/entry-server.js';

async function testSSR() {
  try {
    console.log('Testing SSR...');
    const result = await render('/servers/InditexTech_mcp-teams-server');
    console.log('SSR result keys:', Object.keys(result));
    console.log('Server data exists:', !!result.serverData);
    console.log('SEO data exists:', !!result.seoData);
    
    if (result.seoData) {
      console.log('✅ SEO data generated successfully');
      console.log('Title:', result.seoData.title);
      console.log('Description:', result.seoData.description);
    } else {
      console.log('❌ No SEO data generated');
    }
    
    if (result.html) {
      console.log('✅ HTML generated successfully');
      console.log('HTML length:', result.html.length);
    } else {
      console.log('❌ No HTML generated');
    }
    
  } catch (error) {
    console.error('❌ SSR test failed:', error);
  }
}

testSSR();