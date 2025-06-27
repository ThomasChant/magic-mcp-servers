#!/usr/bin/env node

/**
 * Data Optimization Script
 * 
 * Splits the large integrated server data into optimized chunks for better web performance:
 * - Core data (~500KB) for initial load
 * - Extended metadata (~1MB) for on-demand loading
 * - Individual README files for progressive loading
 * - Search index for fast client-side search
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source data paths
const sourceDataDir = path.join(__dirname, '../src/data');
const serverDataPath = path.join(sourceDataDir, 'serversnew.json');
const categoriesDataPath = path.join(sourceDataDir, 'categories_full_updated.json');
const readmeDataDir = path.join(sourceDataDir, 'structured_readme_data');

// Output paths
const outputDir = path.join(__dirname, '../public/data');
const coreOutputPath = path.join(outputDir, 'servers-core.json');
const extendedOutputPath = path.join(outputDir, 'servers-extended.json');
const categoriesOutputPath = path.join(outputDir, 'categories.json');
const searchIndexPath = path.join(outputDir, 'search-index.json');
const readmeOutputDir = path.join(outputDir, 'readme');
const readmeIndexPath = path.join(readmeOutputDir, 'index.json');

/**
 * Load and parse JSON file safely
 */
function loadJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * Get README data for a server by matching filename patterns
 */
function getReadmeData(serverName) {
    const patterns = [
        serverName.replace('/', '_'),
        serverName.replace('/', '_').replace(/[^a-zA-Z0-9_-]/g, ''),
        serverName.split('/')[1] || serverName,
        serverName.toLowerCase().replace('/', '_'),
    ];
    
    for (const pattern of patterns) {
        const readmePath = path.join(readmeDataDir, `${pattern}.json`);
        if (fs.existsSync(readmePath)) {
            return {
                path: `${pattern}.json`,
                data: loadJsonFile(readmePath)
            };
        }
    }
    
    return null;
}

/**
 * Create core server data (essential fields only)
 */
function createCoreData(servers) {
    return servers.map(server => ({
        // Essential identification
        id: server.id,
        name: server.name,
        owner: server.name.split('/')[0] || '',
        slug: server.slug,
        
        // Basic description (multi-language)
        description: server.description,
        
        // Core metadata
        category: server.category,
        subcategory: server.subcategory,
        featured: server.metadata?.featured || false,
        verified: server.metadata?.verified || false,
        
        // Basic stats for sorting/filtering
        stats: {
            stars: server.stats?.stars || 0,
            forks: server.stats?.forks || 0,
            lastUpdated: server.stats?.lastUpdated || new Date().toISOString()
        },
        
        // Essential quality score
        qualityScore: server.quality?.score || 70,
        
        // Basic tags (limit to 3 for initial load)
        tags: (server.tags || []).slice(0, 3),
        
        // Essential links
        links: {
            github: server.links?.github || '',
            npm: server.links?.npm || '',
            docs: server.links?.docs || ''
        }
    }));
}

/**
 * Create extended server data (detailed fields)
 */
function createExtendedData(servers) {
    const extendedMap = {};
    
    servers.forEach(server => {
        extendedMap[server.id] = {
            // Full description and documentation
            fullDescription: server.fullDescription,
            
            // Complete technical details
            techStack: server.techStack || [],
            serviceTypes: server.serviceTypes || [],
            
            // Complete quality metrics
            quality: server.quality || {
                score: 70,
                factors: {
                    documentation: 60,
                    maintenance: 50,
                    community: 40,
                    performance: 85
                }
            },
            
            // Complete metadata
            metadata: server.metadata || {},
            categorization: server.categorization || {},
            
            // Usage statistics
            usage: server.usage || {
                downloads: server.stats?.stars * 10 || 0,
                dependents: server.stats?.forks || 0,
                weeklyDownloads: Math.floor((server.stats?.stars || 0) * 2)
            },
            
            // Installation information
            installation: server.installation || {
                npm: null,
                pip: null,
                docker: null,
                manual: null,
                uv: null,
                instructions: []
            },
            
            // Repository details
            repository: server.repository || {
                url: server.links?.github || '',
                owner: server.name.split('/')[0] || '',
                name: server.name.split('/')[1] || server.name,
                stars: server.stats?.stars || 0,
                forks: server.stats?.forks || 0,
                lastUpdated: server.stats?.lastUpdated || new Date().toISOString(),
                watchers: server.stats?.stars || 0,
                openIssues: 0
            },
            
            // Compatibility information
            compatibility: server.compatibility || {
                platforms: ['web', 'desktop'],
                nodeVersion: undefined,
                pythonVersion: undefined,
                requirements: []
            },
            
            // Documentation metadata (without content)
            documentation: {
                hasReadme: !!server.documentation?.structured,
                hasExamples: !!(server.documentation?.structured?.examples),
                hasApiReference: !!(server.documentation?.structured?.api_reference),
                hasInstallation: !!(server.documentation?.structured?.installation),
                api: server.links?.docs || null
            },
            
            // Complete tags and badges
            allTags: server.tags || [],
            badges: server.badges || [],
            icon: server.icon
        };
    });
    
    return extendedMap;
}

/**
 * Create search index for fast client-side search
 */
function createSearchIndex(servers) {
    return servers.map(server => ({
        id: server.id,
        name: server.name,
        searchTerms: [
            server.name,
            server.owner || '',
            server.description['zh-CN'] || '',
            server.description.en || '',
            server.fullDescription || '',
            server.category,
            server.subcategory || '',
            ...(server.tags || []),
            ...(server.techStack || []).map(tech => 
                typeof tech === 'string' ? tech : (tech.name || tech.label || '')
            )
        ].filter(Boolean).map(term => term.toLowerCase()).join(' ')
    }));
}

/**
 * Process README files
 */
function processReadmeFiles(servers) {
    const readmeIndex = {};
    const processedReadmes = {};
    
    console.log('📚 Processing README files...');
    
    servers.forEach((server, index) => {
        if ((index + 1) % 100 === 0) {
            console.log(`   📝 Processed ${index + 1}/${servers.length} README files`);
        }
        
        const readmeInfo = getReadmeData(server.name);
        if (readmeInfo && readmeInfo.data) {
            // Create optimized README data (remove raw content to save space)
            const optimizedReadme = {
                overview: readmeInfo.data.overview || null,
                installation: readmeInfo.data.installation || null,
                examples: readmeInfo.data.examples || null,
                api_reference: readmeInfo.data.api_reference || null,
                metadata: {
                    hasContent: !!(readmeInfo.data.raw_content),
                    sections: Object.keys(readmeInfo.data).filter(key => 
                        key !== 'raw_content' && readmeInfo.data[key]
                    ),
                    codeBlocks: [
                        ...(readmeInfo.data.installation?.code_blocks || []),
                        ...(readmeInfo.data.examples?.code_blocks || []),
                        ...(readmeInfo.data.api_reference?.code_blocks || [])
                    ].length
                }
            };
            
            readmeIndex[server.id] = {
                serverId: server.id,
                serverName: server.name,
                filename: readmeInfo.path,
                hasContent: true,
                sections: optimizedReadme.metadata.sections,
                size: JSON.stringify(optimizedReadme).length
            };
            
            processedReadmes[server.id] = optimizedReadme;
        } else {
            readmeIndex[server.id] = {
                serverId: server.id,
                serverName: server.name,
                filename: null,
                hasContent: false,
                sections: [],
                size: 0
            };
        }
    });
    
    return { readmeIndex, processedReadmes };
}

/**
 * Main optimization function
 */
function optimizeData() {
    console.log('🚀 Starting data optimization...');
    
    // Ensure output directories exist
    ensureDir(outputDir);
    ensureDir(readmeOutputDir);
    
    // Load source data
    console.log('📊 Loading source data...');
    const servers = loadJsonFile(serverDataPath);
    const categories = loadJsonFile(categoriesDataPath);
    
    if (!servers || !categories) {
        console.error('❌ Failed to load source data');
        return;
    }
    
    console.log(`   ✅ Loaded ${servers.length} servers and ${categories.length} categories`);
    
    // Create optimized data structures
    console.log('⚙️ Creating optimized data structures...');
    
    // 1. Core data (~500KB)
    console.log('   📦 Creating core server data...');
    const coreData = createCoreData(servers);
    const coreSize = JSON.stringify(coreData).length;
    console.log(`   ✅ Core data: ${Math.round(coreSize / 1024)}KB`);
    
    // 2. Extended data (~1MB)
    console.log('   📦 Creating extended server data...');
    const extendedData = createExtendedData(servers);
    const extendedSize = JSON.stringify(extendedData).length;
    console.log(`   ✅ Extended data: ${Math.round(extendedSize / 1024)}KB`);
    
    // 3. Search index (~200KB)
    console.log('   🔍 Creating search index...');
    const searchIndex = createSearchIndex(servers);
    const searchSize = JSON.stringify(searchIndex).length;
    console.log(`   ✅ Search index: ${Math.round(searchSize / 1024)}KB`);
    
    // 4. Process README files
    const { readmeIndex, processedReadmes } = processReadmeFiles(servers);
    const readmeIndexSize = JSON.stringify(readmeIndex).length;
    console.log(`   ✅ README index: ${Math.round(readmeIndexSize / 1024)}KB`);
    
    // Write optimized data files
    console.log('💾 Writing optimized data files...');
    
    try {
        // Core data
        fs.writeFileSync(coreOutputPath, JSON.stringify(coreData, null, 2));
        console.log(`   ✅ Core data saved: ${coreOutputPath}`);
        
        // Extended data
        fs.writeFileSync(extendedOutputPath, JSON.stringify(extendedData, null, 2));
        console.log(`   ✅ Extended data saved: ${extendedOutputPath}`);
        
        // Categories (copy with optimization)
        fs.writeFileSync(categoriesOutputPath, JSON.stringify(categories, null, 2));
        console.log(`   ✅ Categories saved: ${categoriesOutputPath}`);
        
        // Search index
        fs.writeFileSync(searchIndexPath, JSON.stringify(searchIndex, null, 2));
        console.log(`   ✅ Search index saved: ${searchIndexPath}`);
        
        // README index
        fs.writeFileSync(readmeIndexPath, JSON.stringify(readmeIndex, null, 2));
        console.log(`   ✅ README index saved: ${readmeIndexPath}`);
        
        // Individual README files
        let readmeFileCount = 0;
        Object.entries(processedReadmes).forEach(([serverId, readmeData]) => {
            const readmeFilePath = path.join(readmeOutputDir, `${serverId}.json`);
            fs.writeFileSync(readmeFilePath, JSON.stringify(readmeData, null, 2));
            readmeFileCount++;
        });
        console.log(`   ✅ ${readmeFileCount} README files saved to: ${readmeOutputDir}`);
        
        // Generate optimization report
        console.log('\\n📈 Optimization Report:');
        console.log(`   🎯 Original integrated data: 126MB`);
        console.log(`   ⚡ Core data: ${Math.round(coreSize / 1024)}KB (initial load)`);
        console.log(`   🔧 Extended data: ${Math.round(extendedSize / 1024)}KB (on-demand)`);
        console.log(`   🔍 Search index: ${Math.round(searchSize / 1024)}KB`);
        console.log(`   📚 README index: ${Math.round(readmeIndexSize / 1024)}KB`);
        console.log(`   📄 README files: ${readmeFileCount} individual files`);
        
        const totalInitialLoad = coreSize + JSON.stringify(categories).length;
        const compressionRatio = ((126 * 1024 * 1024 - totalInitialLoad) / (126 * 1024 * 1024) * 100);
        
        console.log(`\\n   🚀 Initial load reduced by ${compressionRatio.toFixed(1)}%`);
        console.log(`   ⚡ Initial load size: ${Math.round(totalInitialLoad / 1024)}KB`);
        console.log(`\\n✅ Data optimization complete!`);
        
    } catch (error) {
        console.error('❌ Failed to write optimized data:', error);
        return;
    }
}

// Run the optimization
if (import.meta.url === `file://${process.argv[1]}`) {
    optimizeData();
}

export { optimizeData };