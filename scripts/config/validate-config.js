#!/usr/bin/env node

/**
 * 配置验证工具
 * 验证所有环境变量是否正确配置
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConfigValidator {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '../..');
        this.envFile = path.join(this.projectRoot, '.env.local');
        this.errors = [];
        this.warnings = [];
        this.info = [];
    }

    /**
     * 加载环境变量
     */
    loadEnv() {
        try {
            if (fs.existsSync(this.envFile)) {
                dotenv.config({ path: this.envFile });
                return true;
            } else {
                this.errors.push('❌ .env.local 文件不存在');
                return false;
            }
        } catch (error) {
            this.errors.push(`❌ 加载环境变量失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 验证必需的配置
     */
    validateRequired() {
        const requiredConfigs = [
            {
                key: 'VITE_SUPABASE_URL',
                description: 'Supabase 项目 URL',
                validator: (value) => {
                    if (!value) return '未设置';
                    if (value.includes('your-project') || value.includes('example')) {
                        return '仍使用占位符值';
                    }
                    if (!value.startsWith('https://') || !value.includes('.supabase.co')) {
                        return '格式不正确，应为 https://xxx.supabase.co';
                    }
                    return null;
                }
            },
            {
                key: 'VITE_SUPABASE_ANON_KEY',
                description: 'Supabase 匿名密钥',
                validator: (value) => {
                    if (!value) return '未设置';
                    if (value.includes('your_') || value.includes('here')) {
                        return '仍使用占位符值';
                    }
                    if (value.length < 100) {
                        return 'Supabase 密钥长度过短';
                    }
                    return null;
                }
            }
        ];

        console.log('🔍 验证必需配置...\n');

        requiredConfigs.forEach(config => {
            const value = process.env[config.key];
            const error = config.validator(value);
            
            if (error) {
                this.errors.push(`❌ ${config.description} (${config.key}): ${error}`);
            } else {
                this.info.push(`✅ ${config.description} (${config.key}): 已正确配置`);
            }
        });
    }

    /**
     * 验证可选配置
     */
    validateOptional() {
        const optionalConfigs = [
            {
                key: 'GITHUB_TOKEN',
                description: 'GitHub API Token',
                validator: (value) => {
                    if (!value || value.includes('your_') || value.includes('here')) {
                        return '建议配置以获取最新仓库统计';
                    }
                    if (!value.startsWith('ghp_') && !value.startsWith('github_pat_')) {
                        return '格式可能不正确';
                    }
                    return null;
                }
            },
            {
                key: 'VITE_CLERK_PUBLISHABLE_KEY',
                description: 'Clerk 公钥',
                validator: (value) => {
                    if (!value || value.includes('your_') || value.includes('here')) {
                        return '建议配置以启用用户认证';
                    }
                    if (!value.startsWith('pk_')) {
                        return '格式不正确，应以 pk_ 开头';
                    }
                    return null;
                }
            },
            {
                key: 'CLERK_SECRET_KEY',
                description: 'Clerk 私钥',
                validator: (value) => {
                    if (!value || value.includes('your_') || value.includes('here')) {
                        return '建议配置以支持服务端认证';
                    }
                    if (!value.startsWith('sk_')) {
                        return '格式不正确，应以 sk_ 开头';
                    }
                    return null;
                }
            }
        ];

        const databaseConfigs = [
            {
                key: 'SUPABASE_HOST',
                description: 'Supabase 数据库主机',
                validator: (value) => {
                    if (!value || value.includes('your_') || value.includes('host')) {
                        return '建议配置以启用Python脚本数据库连接';
                    }
                    if (!value.includes('.supabase.com')) {
                        return '格式可能不正确，应包含.supabase.com';
                    }
                    return null;
                }
            },
            {
                key: 'SUPABASE_USER',
                description: 'Supabase 数据库用户',
                validator: (value) => {
                    if (!value || value.includes('your_') || value.includes('username')) {
                        return '建议配置以启用Python脚本数据库连接';
                    }
                    if (!value.startsWith('postgres.')) {
                        return '格式可能不正确，应以postgres.开头';
                    }
                    return null;
                }
            },
            {
                key: 'SUPABASE_PASSWORD',
                description: 'Supabase 数据库密码',
                validator: (value) => {
                    if (!value || value.includes('your_') || value.includes('password')) {
                        return '建议配置以启用Python脚本数据库连接';
                    }
                    if (value.length < 8) {
                        return '密码长度过短';
                    }
                    return null;
                }
            }
        ];

        const aiConfigs = [
            { key: 'DEEPSEEK_API_KEY', name: 'DeepSeek API' },
            { key: 'GEMINI_API_KEY', name: 'Google Gemini API' },
            { key: 'OPENAI_API_KEY', name: 'OpenAI API' },
            { key: 'ANTHROPIC_API_KEY', name: 'Anthropic Claude API' }
        ];

        console.log('🔍 验证可选配置...\n');

        // 验证通用可选配置
        optionalConfigs.forEach(config => {
            const value = process.env[config.key];
            const warning = config.validator(value);
            
            if (warning) {
                this.warnings.push(`⚠️  ${config.description} (${config.key}): ${warning}`);
            } else {
                this.info.push(`✅ ${config.description} (${config.key}): 已正确配置`);
            }
        });

        // 验证数据库配置
        console.log('🗄️ 验证数据库配置...\n');
        const configuredDatabases = databaseConfigs.filter(db => {
            const value = process.env[db.key];
            return value && !value.includes('your_') && !value.includes('host') && !value.includes('username') && !value.includes('password');
        });

        databaseConfigs.forEach(config => {
            const value = process.env[config.key];
            const warning = config.validator(value);
            
            if (warning) {
                this.warnings.push(`⚠️  ${config.description} (${config.key}): ${warning}`);
            } else {
                this.info.push(`✅ ${config.description} (${config.key}): 已正确配置`);
            }
        });

        // 检查是否有完整的数据库配置
        if (configuredDatabases.length < 3) {
            this.warnings.push('⚠️  数据库配置不完整，Python脚本可能无法正常运行');
        } else {
            this.info.push(`✅ 数据库配置完整，Python脚本可以正常使用`);
        }

        // 验证AI API配置
        const configuredAIs = aiConfigs.filter(ai => {
            const value = process.env[ai.key];
            return value && !value.includes('your_') && !value.includes('here');
        });

        if (configuredAIs.length === 0) {
            this.warnings.push('⚠️  未配置任何AI API，无法使用README智能解析功能');
        } else {
            this.info.push(`✅ 已配置 ${configuredAIs.length} 个AI API: ${configuredAIs.map(ai => ai.name).join(', ')}`);
        }
    }

    /**
     * 验证安全配置
     */
    validateSecurity() {
        console.log('🔍 验证安全配置...\n');

        const securityConfigs = [
            {
                key: 'ENCRYPTION_KEY',
                description: '数据加密密钥',
                validator: (value) => {
                    if (!value || value.includes('your_') || value.includes('here')) {
                        return '建议配置以启用数据加密';
                    }
                    if (value.length < 32) {
                        return '密钥长度不足32字符';
                    }
                    return null;
                }
            },
            {
                key: 'JWT_SECRET',
                description: 'JWT 签名密钥',
                validator: (value) => {
                    if (!value || value.includes('your_') || value.includes('here')) {
                        return '建议配置以启用JWT认证';
                    }
                    if (value.length < 32) {
                        return '密钥长度不足32字符';
                    }
                    return null;
                }
            }
        ];

        securityConfigs.forEach(config => {
            const value = process.env[config.key];
            const warning = config.validator(value);
            
            if (warning) {
                this.warnings.push(`⚠️  ${config.description} (${config.key}): ${warning}`);
            } else {
                this.info.push(`✅ ${config.description} (${config.key}): 已正确配置`);
            }
        });
    }

    /**
     * 验证网络配置
     */
    validateNetwork() {
        console.log('🔍 验证网络配置...\n');

        const githubApiBase = process.env.GITHUB_API_BASE_URL || 'https://api.github.com';
        const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
        const port = process.env.PORT || 3000;

        this.info.push(`✅ GitHub API 地址: ${githubApiBase}`);
        this.info.push(`✅ CORS 源: ${corsOrigin}`);
        this.info.push(`✅ 服务端口: ${port}`);

        // 验证速率限制配置
        const rateLimit = process.env.GITHUB_RATE_LIMIT_DELAY || 750;
        if (rateLimit < 100) {
            this.warnings.push('⚠️  GitHub 请求间隔过短，可能触发速率限制');
        } else {
            this.info.push(`✅ GitHub 请求间隔: ${rateLimit}ms`);
        }
    }

    /**
     * 生成配置报告
     */
    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 配置验证报告');
        console.log('='.repeat(60) + '\n');

        // 显示信息
        if (this.info.length > 0) {
            console.log('✅ 正确配置:\n');
            this.info.forEach(info => console.log(`   ${info}`));
            console.log('');
        }

        // 显示警告
        if (this.warnings.length > 0) {
            console.log('⚠️  建议改进:\n');
            this.warnings.forEach(warning => console.log(`   ${warning}`));
            console.log('');
        }

        // 显示错误
        if (this.errors.length > 0) {
            console.log('❌ 配置错误:\n');
            this.errors.forEach(error => console.log(`   ${error}`));
            console.log('');
        }

        // 总结
        const total = this.info.length + this.warnings.length + this.errors.length;
        if (this.errors.length === 0) {
            console.log('🎉 配置验证通过！');
            if (this.warnings.length > 0) {
                console.log(`💡 建议修复 ${this.warnings.length} 个改进项以获得更好体验`);
            }
        } else {
            console.log(`❌ 发现 ${this.errors.length} 个错误，需要修复后才能正常运行`);
        }

        console.log(`\n📈 配置完成度: ${this.info.length}/${total} (${Math.round(this.info.length/total*100)}%)`);
        
        return this.errors.length === 0;
    }

    /**
     * 运行完整验证
     */
    runValidation() {
        console.log('🔧 MCP Hub 配置验证工具');
        console.log('='.repeat(40) + '\n');

        // 加载环境变量
        if (!this.loadEnv()) {
            console.log('\n❌ 无法加载环境变量文件');
            console.log('💡 请运行以下命令创建配置文件:');
            console.log('   cp .env.example .env.local');
            console.log('   # 然后编辑 .env.local 填入真实配置');
            return false;
        }

        // 运行各项验证
        this.validateRequired();
        this.validateOptional();
        this.validateSecurity();
        this.validateNetwork();

        // 生成报告
        return this.generateReport();
    }
}

// 主函数
function main() {
    const validator = new ConfigValidator();
    const isValid = validator.runValidation();
    
    console.log('\n💡 提示:');
    console.log('   - 运行 node scripts/config/encrypt-env.js validate 进行更详细验证');
    console.log('   - 运行 node scripts/config/encrypt-env.js encrypt 加密敏感配置');
    console.log('   - 查看 .env.example 了解所有可用配置选项');
    
    process.exit(isValid ? 0 : 1);
}

// 检查是否为直接运行
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
    main();
}

export default ConfigValidator;