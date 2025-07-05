#!/usr/bin/env node

/**
 * 安全检查工具
 * 扫描代码库中的硬编码密钥和敏感信息
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SecurityChecker {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '../..');
        this.vulnerabilities = [];
        this.scannedFiles = 0;
        
        // 敏感模式定义
        this.sensitivePatterns = [
            // GitHub tokens
            { 
                pattern: /ghp_[A-Za-z0-9_]{36}/g, 
                type: 'GitHub Personal Access Token',
                severity: 'HIGH'
            },
            { 
                pattern: /github_pat_[A-Za-z0-9_]{22,255}/g, 
                type: 'GitHub Fine-grained PAT',
                severity: 'HIGH'
            },
            
            // API Keys
            { 
                pattern: /sk-[A-Za-z0-9]{20,}/g, 
                type: 'OpenAI API Key',
                severity: 'HIGH'
            },
            { 
                pattern: /sk-ant-[A-Za-z0-9_-]{95,}/g, 
                type: 'Anthropic API Key',
                severity: 'HIGH'
            },
            
            // Database credentials
            { 
                pattern: /postgres\.lptsvryohchbklxcyoyc/g, 
                type: 'Supabase Database Username',
                severity: 'HIGH'
            },
            { 
                pattern: /xgCT84482819/g, 
                type: 'Supabase Database Password',
                severity: 'CRITICAL'
            },
            { 
                pattern: /aws-0-us-east-2\.pooler\.supabase\.com/g, 
                type: 'Supabase Database Host',
                severity: 'MEDIUM'
            },
            
            // Generic patterns
            { 
                pattern: /password\s*[:=]\s*["']([^"']{8,})["']/gi, 
                type: 'Hardcoded Password',
                severity: 'HIGH'
            },
            { 
                pattern: /token\s*[:=]\s*["']([A-Za-z0-9_-]{20,})["']/gi, 
                type: 'Hardcoded Token',
                severity: 'HIGH'
            },
            { 
                pattern: /secret\s*[:=]\s*["']([A-Za-z0-9_-]{16,})["']/gi, 
                type: 'Hardcoded Secret',
                severity: 'HIGH'
            },
            
            // Clerk keys
            { 
                pattern: /pk_(test|live)_[A-Za-z0-9]{26}/g, 
                type: 'Clerk Publishable Key',
                severity: 'MEDIUM'
            },
            { 
                pattern: /sk_(test|live)_[A-Za-z0-9]{26}/g, 
                type: 'Clerk Secret Key',
                severity: 'HIGH'
            }
        ];
        
        // 要扫描的文件扩展名
        this.fileExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.md', '.json', '.env', '.sql'];
        
        // 要忽略的目录
        this.ignoreDirs = [
            'node_modules',
            '.git',
            'dist',
            'build',
            '.next',
            '.vscode',
            'coverage',
            '__pycache__'
        ];
    }

    /**
     * 检查文件是否应该被扫描
     */
    shouldScanFile(filePath) {
        const ext = path.extname(filePath);
        return this.fileExtensions.includes(ext) || path.basename(filePath).includes('.env');
    }

    /**
     * 检查目录是否应该被忽略
     */
    shouldIgnoreDir(dirName) {
        return this.ignoreDirs.includes(dirName);
    }

    /**
     * 扫描单个文件
     */
    scanFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const relativePath = path.relative(this.projectRoot, filePath);
            
            this.scannedFiles++;
            
            this.sensitivePatterns.forEach(({ pattern, type, severity }) => {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    const lineNumber = content.substring(0, match.index).split('\n').length;
                    const line = content.split('\n')[lineNumber - 1];
                    
                    this.vulnerabilities.push({
                        file: relativePath,
                        line: lineNumber,
                        type,
                        severity,
                        pattern: match[0],
                        context: line.trim()
                    });
                }
                // 重置正则表达式的 lastIndex
                pattern.lastIndex = 0;
            });
            
        } catch (error) {
            console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
        }
    }

    /**
     * 递归扫描目录
     */
    scanDirectory(dirPath) {
        try {
            const items = fs.readdirSync(dirPath);
            
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const stat = fs.statSync(itemPath);
                
                if (stat.isDirectory()) {
                    if (!this.shouldIgnoreDir(item)) {
                        this.scanDirectory(itemPath);
                    }
                } else if (stat.isFile()) {
                    if (this.shouldScanFile(itemPath)) {
                        this.scanFile(itemPath);
                    }
                }
            }
        } catch (error) {
            console.warn(`Warning: Could not scan directory ${dirPath}: ${error.message}`);
        }
    }

    /**
     * 生成安全报告
     */
    generateReport() {
        console.log('🔍 安全检查报告');
        console.log('='.repeat(60));
        console.log(`📁 扫描文件数: ${this.scannedFiles}`);
        console.log(`🚨 发现漏洞数: ${this.vulnerabilities.length}`);
        console.log('');

        if (this.vulnerabilities.length === 0) {
            console.log('✅ 未发现硬编码的敏感信息！');
            return true;
        }

        // 按严重程度分组
        const bySeverity = {
            CRITICAL: [],
            HIGH: [],
            MEDIUM: [],
            LOW: []
        };

        this.vulnerabilities.forEach(vuln => {
            bySeverity[vuln.severity].push(vuln);
        });

        // 显示漏洞
        Object.entries(bySeverity).forEach(([severity, vulns]) => {
            if (vulns.length === 0) return;

            const icon = severity === 'CRITICAL' ? '🔥' : 
                        severity === 'HIGH' ? '🚨' : 
                        severity === 'MEDIUM' ? '⚠️' : '📝';
            
            console.log(`${icon} ${severity} 级别漏洞 (${vulns.length}个):`);
            console.log('');

            vulns.forEach((vuln, index) => {
                console.log(`  ${index + 1}. ${vuln.type}`);
                console.log(`     文件: ${vuln.file}:${vuln.line}`);
                console.log(`     内容: ${vuln.context}`);
                if (vuln.pattern.length < 100) {
                    console.log(`     匹配: ${vuln.pattern}`);
                }
                console.log('');
            });
        });

        // 修复建议
        console.log('💡 修复建议:');
        console.log('  1. 将所有硬编码的密钥移动到环境变量');
        console.log('  2. 使用 .env.local 文件管理敏感配置');
        console.log('  3. 运行 node scripts/config/encrypt-env.js encrypt 加密配置');
        console.log('  4. 确保 .env.local 已添加到 .gitignore');
        console.log('  5. 更新文档中的示例，使用占位符而非真实值');

        return false;
    }

    /**
     * 运行安全检查
     */
    runScan() {
        console.log('🔒 开始安全检查...');
        console.log(`📂 扫描目录: ${this.projectRoot}`);
        console.log('');

        const startTime = Date.now();
        this.scanDirectory(this.projectRoot);
        const duration = Date.now() - startTime;

        console.log(`⏱️  扫描完成，耗时 ${duration}ms`);
        console.log('');

        return this.generateReport();
    }
}

// 主函数
function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
🔒 安全检查工具

用法: node security-check.js [选项]

选项:
  --help, -h    显示帮助信息

功能:
  - 扫描代码库中的硬编码密钥和敏感信息
  - 检测 GitHub token、API key、数据库凭据等
  - 提供详细的安全报告和修复建议

示例:
  node scripts/config/security-check.js    # 运行安全检查
`);
        return;
    }

    const checker = new SecurityChecker();
    const isSecure = checker.runScan();
    
    process.exit(isSecure ? 0 : 1);
}

// 检查是否为直接运行
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
    main();
}

export default SecurityChecker;