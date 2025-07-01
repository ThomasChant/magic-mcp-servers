import fs from "node:fs/promises";
import express from "express";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

const app = express();
const port = 3003;

// Serve static files
app.use(express.static('./dist/client'));

app.get('/servers/:slug', async (req, res) => {
  try {
    console.log('=== STARTING SSR TEST ===');
    
    // Read template
    const template = await fs.readFile('./index-ssr.html', 'utf-8');
    console.log('Template read, length:', template.length);
    console.log('Has app-head placeholder:', template.includes('<!--app-head-->'));
    console.log('Has app-html placeholder:', template.includes('<!--app-html-->'));
    
    // Import SSR
    const serverModule = await import('./dist/server/entry-server.js');
    console.log('SSR module imported');
    
    // Execute SSR
    const result = await serverModule.render(req.url);
    console.log('SSR executed');
    console.log('Has seoData:', !!result.seoData);
    console.log('Has html:', !!result.html);
    
    if (result.seoData) {
      console.log('SEO title:', result.seoData.title);
    }
    
    // Apply replacements
    let finalHtml = template;
    
    if (result.seoData) {
      finalHtml = finalHtml.replace('<!--app-head-->', `<title>${result.seoData.title}</title>`);
      console.log('SEO replacement applied');
    }
    
    finalHtml = finalHtml.replace('<!--app-html-->', result.html || '');
    console.log('HTML replacement applied');
    
    // Check final result
    console.log('Final HTML has placeholder:', finalHtml.includes('<!--app-'));
    console.log('Final HTML has dynamic title:', result.seoData ? finalHtml.includes(result.seoData.title) : false);
    
    // Send response
    res.status(200).set({ "Content-Type": "text/html" }).send(finalHtml);
    console.log('=== SSR TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send(`Error: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Test server at http://localhost:${port}`);
});