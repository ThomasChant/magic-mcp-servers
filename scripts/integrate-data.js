#!/usr/bin/env node

/**
 * Data Integration Script
 * 
 * Integrates repository details and structured README data into the main server data structure
 * This creates a comprehensive local dataset for the frontend to use without separate API calls
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const serverDataPath = path.join(__dirname, '../src/data/serversnew.json');
const readmeDataDir = path.join(__dirname, '../public/structured_readme_data');
const outputPath = path.join(__dirname, '../src/data/servers_integrated.json');

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
 * Get README data for a server by matching filename patterns
 */
function getReadmeData(serverName) {
    // Convert server name to possible README filename patterns
    const patterns = [
        serverName.replace('/', '_'),
        serverName.replace('/', '_').replace(/[^a-zA-Z0-9_-]/g, ''),
        serverName.split('/')[1] || serverName,
        serverName.toLowerCase().replace('/', '_'),
    ];
    
    for (const pattern of patterns) {
        const readmePath = path.join(readmeDataDir, `${pattern}.json`);
        if (fs.existsSync(readmePath)) {
            return loadJsonFile(readmePath);
        }
    }
    
    return null;
}

/**
 * Extract repository details from GitHub URL
 */
function extractRepoDetails(githubUrl) {
    if (!githubUrl) return null;
    
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
        return {
            owner: match[1],
            name: match[2],
            url: githubUrl
        };
    }
    return null;
}

/**
 * Generate installation instructions based on available data
 */
function generateInstallationInstructions(server, readmeData) {
    const installation = {
        npm: null,
        pip: null,
        docker: null,
        manual: null,
        uv: null,
        instructions: []
    };
    
    // Extract from README if available
    if (readmeData && readmeData.installation) {
        // Parse installation code blocks
        readmeData.installation.code_blocks.forEach(block => {
            const code = block.code;
            
            if (block.language === 'bash' || block.language === 'shell') {
                if (code.includes('npm install')) {
                    const npmMatch = code.match(/npm install\s+([\w-@\/]+)/);
                    if (npmMatch) {
                        installation.npm = npmMatch[1];
                    }
                }
                
                if (code.includes('pip install')) {
                    const pipMatch = code.match(/pip install\s+([\w-]+)/);
                    if (pipMatch) {
                        installation.pip = pipMatch[1];
                    }
                }
                
                if (code.includes('uv run')) {
                    installation.uv = code;
                }
                
                if (code.includes('docker')) {
                    installation.docker = code;
                }
            }
        });
        
        // Add full installation content as manual instructions
        installation.manual = readmeData.installation.content;
        
        // Extract structured instructions
        installation.instructions = readmeData.installation.code_blocks.map(block => ({
            type: block.language || 'text',
            content: block.code,
            description: `${block.language} installation`
        }));
    }
    
    // Fallback to repo-based guessing
    if (!installation.npm && server.links.github) {
        const repoName = server.links.github.split('/').pop();
        const techStackNames = (server.techStack || []).map(tech => 
            typeof tech === 'string' ? tech : (tech.name || tech.label || '')
        ).join(' ').toLowerCase();
        
        if (techStackNames.includes('node') || techStackNames.includes('javascript') || techStackNames.includes('npm')) {
            installation.npm = repoName;
        }
        if (techStackNames.includes('python') || techStackNames.includes('pip')) {
            installation.pip = repoName;
        }
    }
    
    return installation;
}

/**
 * Main integration function
 */
function integrateData() {
    console.log('🔄 Starting data integration...');
    
    // Load server data
    const serverData = loadJsonFile(serverDataPath);
    if (!serverData) {
        console.error('❌ Failed to load server data');
        return;
    }
    
    console.log(`📊 Loaded ${serverData.length} servers`);
    
    // Process each server
    const integratedServers = serverData.map((server, index) => {
        if ((index + 1) % 100 === 0) {
            console.log(`📝 Processed ${index + 1}/${serverData.length} servers`);
        }
        
        // Get README data
        const readmeData = getReadmeData(server.name);
        
        // Extract repository details
        const repoDetails = extractRepoDetails(server.links.github);
        
        // Create integrated server object
        const integratedServer = {
            ...server,
            
            // Enhanced repository information
            repository: {
                url: server.links.github || '',
                owner: repoDetails?.owner || server.name.split('/')[0] || '',
                name: repoDetails?.name || server.name.split('/')[1] || server.name,
                stars: server.stats.stars || 0,
                forks: server.stats.forks || 0,
                lastUpdated: server.stats.lastUpdated || new Date().toISOString(),
                watchers: server.stats.stars || 0, // Approximate
                openIssues: 0, // Would need GitHub API to get real data
            },
            
            // Enhanced installation instructions
            installation: generateInstallationInstructions(server, readmeData),
            
            // Enhanced documentation
            documentation: {
                readme: readmeData?.raw_content || server.fullDescription,
                overview: readmeData?.overview || null,
                installation: readmeData?.installation || null,
                examples: readmeData?.examples || null,
                api_reference: readmeData?.api_reference || null,
                api: server.links.docs || null,
                structured: readmeData || null
            },
            
            // Enhanced compatibility based on tech stack
            compatibility: {
                platforms: ['web', 'desktop'], // Default
                nodeVersion: (() => {
                    const techStackNames = (server.techStack || []).map(tech => 
                        typeof tech === 'string' ? tech : (tech.name || tech.label || '')
                    ).join(' ').toLowerCase();
                    return techStackNames.includes('node') || techStackNames.includes('javascript') ? '16+' : undefined;
                })(),
                pythonVersion: (() => {
                    const techStackNames = (server.techStack || []).map(tech => 
                        typeof tech === 'string' ? tech : (tech.name || tech.label || '')
                    ).join(' ').toLowerCase();
                    return techStackNames.includes('python') ? '3.8+' : undefined;
                })(),
                requirements: extractRequirements(readmeData)
            },
            
            // Enhanced quality scoring based on documentation completeness
            quality: {
                ...server.quality || {
                    score: 70,
                    factors: {
                        documentation: 60,
                        maintenance: 50,
                        community: 40,
                        performance: 85
                    }
                },
                factors: {
                    documentation: calculateDocumentationScore(readmeData, server),
                    maintenance: calculateMaintenanceScore(server),
                    community: calculateCommunityScore(server),
                    performance: 85 // Default
                }
            }
        };
        
        // Recalculate overall quality score
        const factors = integratedServer.quality.factors;
        integratedServer.quality.score = Math.round(
            (factors.documentation + factors.maintenance + factors.community + factors.performance) / 4
        );
        
        return integratedServer;
    });
    
    // Write integrated data
    try {
        fs.writeFileSync(outputPath, JSON.stringify(integratedServers, null, 2));
        console.log(`✅ Integration complete! Saved to ${outputPath}`);
        console.log(`📈 Integrated ${integratedServers.length} servers with enhanced data`);
        
        // Generate statistics
        const withReadme = integratedServers.filter(s => s.documentation.structured).length;
        const withInstallation = integratedServers.filter(s => 
            s.installation.npm || s.installation.pip || s.installation.docker || s.installation.uv
        ).length;
        
        console.log(`📚 ${withReadme} servers have structured README data`);
        console.log(`⚙️ ${withInstallation} servers have installation instructions`);
        
    } catch (error) {
        console.error('❌ Failed to write integrated data:', error);
    }
}

/**
 * Extract requirements from README data
 */
function extractRequirements(readmeData) {
    if (!readmeData) return [];
    
    const requirements = [];
    const content = readmeData.raw_content || '';
    
    // Look for common requirement patterns
    if (content.includes('Node.js')) {
        const nodeMatch = content.match(/Node\.js\s+(\d+[\.\d+]*)/i);
        if (nodeMatch) requirements.push(`Node.js ${nodeMatch[1]}+`);
    }
    
    if (content.includes('Python')) {
        const pythonMatch = content.match(/Python\s+(\d+[\.\d+]*)/i);
        if (pythonMatch) requirements.push(`Python ${pythonMatch[1]}+`);
    }
    
    if (content.includes('uv')) {
        requirements.push('uv package manager');
    }
    
    return requirements;
}

/**
 * Calculate documentation quality score
 */
function calculateDocumentationScore(readmeData, server) {
    let score = 40; // Base score
    
    if (readmeData) {
        // Bonus for having structured README
        score += 20;
        
        // Bonus for different sections
        if (readmeData.overview && readmeData.overview.content) score += 10;
        if (readmeData.installation && readmeData.installation.content) score += 15;
        if (readmeData.examples && readmeData.examples.content) score += 10;
        if (readmeData.api_reference && readmeData.api_reference.content) score += 15;
        
        // Bonus for code examples
        const totalCodeBlocks = [
            ...(readmeData.installation?.code_blocks || []),
            ...(readmeData.examples?.code_blocks || []),
            ...(readmeData.api_reference?.code_blocks || [])
        ].length;
        
        score += Math.min(totalCodeBlocks * 2, 10);
    }
    
    // Bonus for external docs
    if (server.links.docs) score += 5;
    
    // Bonus for detailed description
    if (server.fullDescription && server.fullDescription.length > 100) score += 5;
    
    return Math.min(score, 100);
}

/**
 * Calculate maintenance quality score
 */
function calculateMaintenanceScore(server) {
    let score = 50; // Base score
    
    // Bonus for maturity level
    const maturity = server.metadata.maturity.toLowerCase();
    if (maturity === 'stable') score += 30;
    else if (maturity === 'beta') score += 20;
    else if (maturity === 'alpha') score += 10;
    
    // Bonus for recent updates (if available)
    if (server.stats.lastUpdated) {
        const lastUpdate = new Date(server.stats.lastUpdated);
        const now = new Date();
        const daysSince = (now - lastUpdate) / (1000 * 60 * 60 * 24);
        
        if (daysSince < 30) score += 20;
        else if (daysSince < 90) score += 10;
        else if (daysSince < 180) score += 5;
    }
    
    return Math.min(score, 100);
}

/**
 * Calculate community quality score
 */
function calculateCommunityScore(server) {
    let score = 30; // Base score
    
    const stars = server.stats.stars || 0;
    const forks = server.stats.forks || 0;
    
    // Bonus for GitHub stars
    if (stars > 1000) score += 40;
    else if (stars > 500) score += 30;
    else if (stars > 100) score += 20;
    else if (stars > 50) score += 15;
    else if (stars > 10) score += 10;
    else if (stars > 0) score += 5;
    
    // Bonus for forks
    if (forks > 100) score += 20;
    else if (forks > 50) score += 15;
    else if (forks > 10) score += 10;
    else if (forks > 5) score += 5;
    
    // Bonus for being featured or verified
    if (server.metadata.featured) score += 10;
    if (server.metadata.verified) score += 5;
    
    return Math.min(score, 100);
}

// Run the integration
if (import.meta.url === `file://${process.argv[1]}`) {
    integrateData();
}

export { integrateData };