import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function deploySitemaps() {
    console.log('🚀 Deploying sitemaps to all required locations...');
    
    const sourceDir = path.join(__dirname, '..', 'public');
    const deployLocations = [
        path.join(__dirname, '..', 'dist', 'client'),
        path.join(__dirname, '..', 'dist', 'static')
    ];
    
    const sitemapFiles = [
        'sitemap.xml',
        'sitemap-servers.xml', 
        'sitemap-categories.xml',
        'sitemap-tags.xml',
        'sitemap-complete.xml',
        'sitemapindex.xml'
    ];
    
    try {
        // Ensure all destination directories exist
        for (const destDir of deployLocations) {
            await fs.mkdir(destDir, { recursive: true });
            console.log(`✅ Created directory: ${destDir}`);
        }
        
        // Copy all sitemap files to all locations
        for (const file of sitemapFiles) {
            const sourceFile = path.join(sourceDir, file);
            
            try {
                const content = await fs.readFile(sourceFile, 'utf-8');
                
                for (const destDir of deployLocations) {
                    const destFile = path.join(destDir, file);
                    await fs.writeFile(destFile, content, 'utf-8');
                    console.log(`✅ Deployed: ${file} → ${destDir}`);
                }
            } catch (error) {
                console.error(`❌ Error deploying ${file}:`, error);
            }
        }
        
        console.log('🎉 All sitemaps deployed successfully!');
        
        // Show deployment summary
        console.log('\n📋 Deployment Summary:');
        console.log(`   📁 Source: public/`);
        for (const location of deployLocations) {
            console.log(`   📁 Deployed to: ${path.relative(__dirname + '/..', location)}/`);
        }
        console.log(`   📄 Files: ${sitemapFiles.length} sitemap files`);
        
    } catch (error) {
        console.error('❌ Error during deployment:', error);
        process.exit(1);
    }
}

// Run deployment
deploySitemaps();