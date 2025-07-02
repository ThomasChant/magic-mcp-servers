import fs from "node:fs/promises";
import express from "express";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

const app = express();
const port = 3005;

// Serve static files
app.use(express.static('./dist/client'));

app.get('/test-ssr', async (req, res) => {
  try {
    console.log('=== TESTING COMPLETE SSR FLOW ===');
    
    // Step 1: Import SSR
    console.log('Step 1: Importing SSR...');
    const serverModule = await import('../dist/server/entry-server.js');
    
    // Step 2: Execute SSR
    console.log('Step 2: Executing SSR...');
    const testUrl = '/servers/InditexTech_mcp-teams-server';
    const result = await serverModule.render(testUrl);
    
    console.log('SSR Result:');
    console.log('- HTML length:', result.html?.length || 0);
    console.log('- Has SEO data:', !!result.seoData);
    console.log('- Has server data:', !!result.serverData);
    
    if (result.seoData) {
      console.log('- SEO title:', result.seoData.title);
    }
    
    // Step 3: Read template
    console.log('Step 3: Reading template...');
    let template = await fs.readFile('./index-ssr.html', 'utf-8');
    console.log('- Template length:', template.length);
    console.log('- Has app-head placeholder:', template.includes('<!--app-head-->'));
    console.log('- Has app-html placeholder:', template.includes('<!--app-html-->'));
    
    // Step 4: Update template for production
    console.log('Step 4: Updating template...');
    template = template.replace(
      'src="/src/entry-client.tsx"', 
      'type="module" crossorigin src="/assets/client-ssr-C7Wy1hAj.js"'
    );
    template = template.replace('</head>', `    <link rel="stylesheet" crossorigin href="/assets/index-Cw0W-wPH.css">
  </head>`);
    
    // Step 5: Apply SEO replacements
    console.log('Step 5: Applying SEO...');
    if (result.seoData) {
      const seoHead = `<title>${result.seoData.title}</title>`;
      template = template.replace('<!--app-head-->', seoHead);
      console.log('- SEO applied');
    } else {
      template = template.replace('<!--app-head-->', '');
      console.log('- No SEO data');
    }
    
    // Step 6: Apply HTML replacements
    console.log('Step 6: Applying HTML...');
    const beforeLength = template.length;
    template = template.replace('<!--app-html-->', result.html || '');
    const afterLength = template.length;
    console.log('- Template length before HTML injection:', beforeLength);
    console.log('- Template length after HTML injection:', afterLength);
    console.log('- HTML content added:', afterLength - beforeLength);
    
    // Step 7: Verify final result
    console.log('Step 7: Verifying result...');
    const hasEmptyRoot = template.includes('<div id="root"></div>');
    const hasContentRoot = template.includes('<div id="root">') && !hasEmptyRoot;
    
    console.log('- Has empty root div:', hasEmptyRoot);
    console.log('- Has content in root div:', hasContentRoot);
    
    // Find the root div content
    const rootMatch = template.match(/<div id="root">(.*?)<\/div>/s);
    if (rootMatch) {
      const rootContent = rootMatch[1];
      console.log('- Root content length:', rootContent.length);
      console.log('- Root content preview:', rootContent.substring(0, 100));
    }
    
    console.log('=== SSR TEST COMPLETE ===');
    
    // Send the result
    res.status(200).set({ "Content-Type": "text/html" }).send(template);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('❌ Stack:', error.stack);
    res.status(500).send(`Error: ${error.message}`);
  }
});

app.get('/', (req, res) => {
  res.send('<h1>Minimal SSR Test Server</h1><p><a href="/test-ssr">Test SSR</a></p>');
});

app.listen(port, () => {
  console.log(`✅ Minimal SSR test server running at http://localhost:${port}`);
  console.log(`🔍 Test SSR at: http://localhost:${port}/test-ssr`);
});