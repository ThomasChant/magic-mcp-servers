import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Input and output paths
const logoPath = path.join(__dirname, '../src/assets/logo.png');
const outputDir = path.join(__dirname, '../public');
const faviconPath = path.join(outputDir, 'favicon.ico');

// Favicon sizes for multi-resolution ICO
const faviconSizes = [16, 32, 48];

async function generateFavicon() {
  try {
    console.log('🎨 Generating favicon from logo...');
    
    // Check if logo exists
    try {
      await fs.access(logoPath);
    } catch {
      console.error('❌ Logo file not found at:', logoPath);
      process.exit(1);
    }

    // Generate PNG favicons for different sizes
    const pngBuffers = await Promise.all(
      faviconSizes.map(async (size) => {
        console.log(`  📐 Creating ${size}x${size} favicon...`);
        const buffer = await sharp(logoPath)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png()
          .toBuffer();
        
        // Also save individual PNG files
        const pngPath = path.join(outputDir, `favicon-${size}x${size}.png`);
        await fs.writeFile(pngPath, buffer);
        console.log(`  ✅ Saved ${pngPath}`);
        
        return buffer;
      })
    );

    // Generate apple-touch-icon (180x180)
    console.log('  📱 Creating apple-touch-icon...');
    await sharp(logoPath)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    console.log('  ✅ Saved apple-touch-icon.png');

    // Generate android-chrome icons
    const androidSizes = [192, 512];
    for (const size of androidSizes) {
      console.log(`  🤖 Creating android-chrome-${size}x${size}..`);
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(path.join(outputDir, `android-chrome-${size}x${size}.png`));
      console.log(`  ✅ Saved android-chrome-${size}x${size}.png`);
    }

    // Note: Creating a proper multi-resolution ICO file requires additional libraries
    // For now, we'll copy the 32x32 PNG as favicon.ico
    // In production, you might want to use a tool like png-to-ico
    console.log('  🔧 Creating favicon.ico...');
    const favicon32 = await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toBuffer();
    
    await fs.writeFile(faviconPath, favicon32);
    console.log('  ✅ Saved favicon.ico (32x32 PNG format)');

    // Update manifest.json with icon paths
    const manifestPath = path.join(outputDir, 'manifest.json');
    try {
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);
      
      manifest.icons = [
        {
          src: "/favicon-16x16.png",
          sizes: "16x16",
          type: "image/png"
        },
        {
          src: "/favicon-32x32.png",
          sizes: "32x32",
          type: "image/png"
        },
        {
          src: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png"
        }
      ];
      
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
      console.log('  ✅ Updated manifest.json');
    } catch (e) {
      console.warn('  ⚠️  Could not update manifest.json:', e.message);
    }

    console.log('\n🎉 Favicon generation complete!');
    console.log('\n📝 Add these tags to your HTML <head>:');
    console.log(`
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
`);

  } catch (error) {
    console.error('❌ Error generating favicon:', error);
    process.exit(1);
  }
}

// Run the script
generateFavicon();