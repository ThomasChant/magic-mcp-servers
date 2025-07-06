import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Input and output paths
const logoPath = path.join(__dirname, '../src/assets/logo.png');
const outputDir = path.join(__dirname, '../public');
const tempDir = path.join(__dirname, '../temp-favicon');

// Favicon sizes for multi-resolution ICO
const icoSizes = [16, 32, 48, 64];

async function generateRealICO() {
  try {
    console.log('🎨 Generating real multi-resolution favicon.ico...');
    
    // Create temp directory
    await fs.mkdir(tempDir, { recursive: true });
    
    // Generate PNG files for each size
    const pngFiles = [];
    for (const size of icoSizes) {
      const filename = `favicon-${size}.png`;
      const filepath = path.join(tempDir, filename);
      
      console.log(`  📐 Creating ${size}x${size} PNG...`);
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(filepath);
      
      pngFiles.push(filepath);
    }
    
    // Try to use ImageMagick to create real ICO
    try {
      const icoPath = path.join(outputDir, 'favicon.ico');
      const command = `convert ${pngFiles.join(' ')} ${icoPath}`;
      
      console.log('  🔧 Creating multi-resolution ICO with ImageMagick...');
      await execPromise(command);
      console.log('  ✅ Created real multi-resolution favicon.ico!');
    } catch (error) {
      console.log('  ⚠️  ImageMagick not found, using fallback method');
      
      // Fallback: Use the 32x32 PNG as favicon.ico
      const favicon32Path = path.join(tempDir, 'favicon-32.png');
      const icoPath = path.join(outputDir, 'favicon.ico');
      await fs.copyFile(favicon32Path, icoPath);
      console.log('  ✅ Created favicon.ico (PNG format fallback)');
    }
    
    // Clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true });
    console.log('  🧹 Cleaned up temporary files');
    
    console.log('\n🎉 Favicon generation complete!');
    
  } catch (error) {
    console.error('❌ Error generating favicon:', error);
    // Clean up on error
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {}
    process.exit(1);
  }
}

// Alternative: Generate Base64 favicon for inline embedding
async function generateBase64Favicon() {
  try {
    console.log('\n🔗 Generating Base64 favicon for inline use...');
    
    const favicon32 = await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toBuffer();
    
    const base64 = favicon32.toString('base64');
    const dataUri = `data:image/png;base64,${base64}`;
    
    console.log('\n📝 Base64 Data URI (for inline use):');
    console.log(`<link rel="icon" href="${dataUri.substring(0, 50)}..." />`);
    console.log(`\nFull data URI length: ${dataUri.length} characters`);
    
    // Save to file for reference
    const base64Path = path.join(outputDir, 'favicon-base64.txt');
    await fs.writeFile(base64Path, dataUri);
    console.log(`\n✅ Saved full Base64 data URI to: ${base64Path}`);
    
  } catch (error) {
    console.error('❌ Error generating Base64 favicon:', error);
  }
}

// Run both methods
async function main() {
  await generateRealICO();
  await generateBase64Favicon();
}

main();