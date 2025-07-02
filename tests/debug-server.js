import fs from "node:fs/promises";
import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const port = 3002;

// Serve static files from dist/client
app.use(express.static('./dist/client'));

app.get('/servers/:slug', async (req, res) => {
  try {
    const url = req.url;
    console.log(`📡 DEBUG: Processing request: ${url}`);
    
    // Test template reading
    console.log('📡 DEBUG: Reading template...');
    const template = await fs.readFile('./dist/client/index-ssr.html', 'utf-8');
    console.log('📡 DEBUG: Template length:', template.length);
    console.log('📡 DEBUG: Template has <!--app-head-->:', template.includes('<!--app-head-->'));
    console.log('📡 DEBUG: Template has <!--app-html-->:', template.includes('<!--app-html-->'));
    
    // Test SSR import
    console.log('📡 DEBUG: Importing SSR module...');
    const serverModule = await import('../dist/server/entry-server.js');
    console.log('📡 DEBUG: SSR module imported successfully');
    
    // Test SSR execution
    console.log('📡 DEBUG: Executing SSR...');
    const result = await serverModule.render(url);
    console.log('📡 DEBUG: SSR completed');
    console.log('📡 DEBUG: Has seoData:', !!result.seoData);
    console.log('📡 DEBUG: HTML length:', result.html?.length || 0);
    
    // Test replacements
    let finalHtml = template;
    
    if (result.seoData) {
      console.log('📡 DEBUG: Applying SEO replacements...');
      const dynamicHead = `<title>${result.seoData.title}</title>`;
      finalHtml = finalHtml.replace('<!--app-head-->', dynamicHead);
      console.log('📡 DEBUG: SEO replacement applied');
    }
    
    console.log('📡 DEBUG: Applying HTML replacements...');
    finalHtml = finalHtml.replace('<!--app-html-->', result.html || '');
    console.log('📡 DEBUG: HTML replacement applied');
    
    // Check final result
    console.log('📡 DEBUG: Final HTML still has <!--app-head-->:', finalHtml.includes('<!--app-head-->'));
    console.log('📡 DEBUG: Final HTML still has <!--app-html-->:', finalHtml.includes('<!--app-html-->'));
    console.log('📡 DEBUG: Final HTML has dynamic title:', result.seoData ? finalHtml.includes(result.seoData.title) : false);
    
    console.log('📡 DEBUG: Sending response...');
    res.status(200).set({ "Content-Type": "text/html" }).send(finalHtml);
    
  } catch (error) {
    console.error('❌ DEBUG: Error occurred:', error.message);
    console.error('❌ DEBUG: Stack:', error.stack);
    res.status(500).send(`Error: ${error.message}`);
  }
});

// Catch all other routes
app.get('*', (req, res) => {
  res.send('Debug server - only /servers/:slug routes are handled');
});

app.listen(port, () => {
  console.log(`🔍 Debug server started at http://localhost:${port}`);
});