#!/usr/bin/env node

/**
 * 环境变量加密管理工具
 * 用于安全管理敏感的环境变量配置
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

class EnvEncryption {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '../..');
        this.envFile = path.join(this.projectRoot, '.env.local');
        this.encryptedFile = path.join(this.projectRoot, '.env.encrypted');
        this.keyFile = path.join(this.projectRoot, '.env.key');
    }

    /**
     * 生成加密密钥
     */
    generateKey(password) {
        const salt = crypto.randomBytes(SALT_LENGTH);
        const key = crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
        return { key, salt };
    }

    /**
     * 从密码派生密钥
     */
    deriveKey(password, salt) {
        return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
    }

    /**
     * 加密环境变量文件
     */
    async encryptEnvFile(password) {
        try {
            // 检查环境变量文件是否存在
            if (!fs.existsSync(this.envFile)) {
                console.error('❌ .env.local 文件不存在，请先创建配置文件');
                return false;
            }

            // 读取环境变量文件
            const envContent = fs.readFileSync(this.envFile, 'utf8');
            
            // 生成密钥和盐
            const { key, salt } = this.generateKey(password);
            
            // 创建加密器
            const iv = crypto.randomBytes(IV_LENGTH);
            const cipher = crypto.createCipher(ALGORITHM, key);
            cipher.setAutoPadding(true);
            
            // 加密数据
            let encrypted = cipher.update(envContent, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const tag = cipher.getAuthTag();

            // 创建加密数据结构
            const encryptedData = {
                algorithm: ALGORITHM,
                salt: salt.toString('hex'),
                iv: iv.toString('hex'),
                tag: tag.toString('hex'),
                data: encrypted,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };

            // 保存加密文件
            fs.writeFileSync(
                this.encryptedFile, 
                JSON.stringify(encryptedData, null, 2)
            );

            console.log('✅ 环境变量文件已成功加密');
            console.log(`📁 加密文件位置: ${this.encryptedFile}`);
            console.log('🔒 请安全保管您的解密密码');
            
            return true;
        } catch (error) {
            console.error('❌ 加密失败:', error.message);
            return false;
        }
    }

    /**
     * 解密环境变量文件
     */
    async decryptEnvFile(password) {
        try {
            // 检查加密文件是否存在
            if (!fs.existsSync(this.encryptedFile)) {
                console.error('❌ 加密文件不存在');
                return false;
            }

            // 读取加密文件
            const encryptedData = JSON.parse(fs.readFileSync(this.encryptedFile, 'utf8'));
            
            // 从加密数据中提取信息
            const salt = Buffer.from(encryptedData.salt, 'hex');
            const iv = Buffer.from(encryptedData.iv, 'hex');
            const tag = Buffer.from(encryptedData.tag, 'hex');
            const encrypted = encryptedData.data;

            // 派生密钥
            const key = this.deriveKey(password, salt);

            // 创建解密器
            const decipher = crypto.createDecipher(ALGORITHM, key);
            decipher.setAuthTag(tag);
            decipher.setAutoPadding(true);

            // 解密数据
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            // 保存解密后的文件
            fs.writeFileSync(this.envFile, decrypted);

            console.log('✅ 环境变量文件已成功解密');
            console.log(`📁 解密文件位置: ${this.envFile}`);
            
            return true;
        } catch (error) {
            console.error('❌ 解密失败:', error.message);
            console.error('   可能的原因: 密码错误或文件损坏');
            return false;
        }
    }

    /**
     * 验证环境变量
     */
    validateEnvFile() {
        try {
            if (!fs.existsSync(this.envFile)) {
                console.error('❌ .env.local 文件不存在');
                return false;
            }

            const envContent = fs.readFileSync(this.envFile, 'utf8');
            const lines = envContent.split('\n').filter(line => 
                line.trim() && !line.trim().startsWith('#')
            );

            const requiredVars = [
                'VITE_SUPABASE_URL',
                'VITE_SUPABASE_ANON_KEY'
            ];

            const optionalVars = [
                'GITHUB_TOKEN',
                'VITE_CLERK_PUBLISHABLE_KEY',
                'DEEPSEEK_API_KEY',
                'GEMINI_API_KEY',
                'OPENAI_API_KEY',
                'SUPABASE_HOST',
                'SUPABASE_USER', 
                'SUPABASE_PASSWORD'
            ];

            const foundVars = {};
            const errors = [];
            const warnings = [];

            // 解析环境变量
            lines.forEach(line => {
                const [key, value] = line.split('=').map(s => s.trim());
                if (key && value) {
                    foundVars[key] = value;
                }
            });

            // 检查必需变量
            requiredVars.forEach(varName => {
                if (!foundVars[varName]) {
                    errors.push(`缺少必需变量: ${varName}`);
                } else if (foundVars[varName].includes('your_') || foundVars[varName].includes('here')) {
                    errors.push(`变量 ${varName} 仍使用占位符值`);
                }
            });

            // 检查可选变量
            const hasAtLeastOneAPI = optionalVars.some(varName => 
                foundVars[varName] && 
                !foundVars[varName].includes('your_') && 
                !foundVars[varName].includes('here')
            );

            if (!hasAtLeastOneAPI) {
                warnings.push('建议至少配置一个AI API密钥 (DEEPSEEK_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY)');
            }

            // 检查GitHub Token
            if (!foundVars['GITHUB_TOKEN'] || foundVars['GITHUB_TOKEN'].includes('your_')) {
                warnings.push('未配置GITHUB_TOKEN，将无法获取最新的仓库统计信息');
            }

            // 显示结果
            if (errors.length === 0) {
                console.log('✅ 环境变量验证通过');
                console.log(`📊 已配置 ${Object.keys(foundVars).length} 个变量`);
                
                if (warnings.length > 0) {
                    console.log('\n⚠️  建议改进:');
                    warnings.forEach(warning => console.log(`   - ${warning}`));
                }
                
                return true;
            } else {
                console.log('❌ 环境变量验证失败');
                console.log('\n🔴 错误:');
                errors.forEach(error => console.log(`   - ${error}`));
                
                if (warnings.length > 0) {
                    console.log('\n⚠️  警告:');
                    warnings.forEach(warning => console.log(`   - ${warning}`));
                }
                
                return false;
            }
        } catch (error) {
            console.error('❌ 验证过程中出错:', error.message);
            return false;
        }
    }

    /**
     * 创建安全备份
     */
    createBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(this.projectRoot, `.env.backup.${timestamp}`);
            
            if (fs.existsSync(this.envFile)) {
                fs.copyFileSync(this.envFile, backupFile);
                console.log(`✅ 已创建备份: ${backupFile}`);
                return backupFile;
            } else {
                console.log('⚠️  没有找到 .env.local 文件，无需备份');
                return null;
            }
        } catch (error) {
            console.error('❌ 创建备份失败:', error.message);
            return null;
        }
    }

    /**
     * 清理敏感文件
     */
    cleanup() {
        const sensitiveFiles = [this.envFile, this.keyFile];
        let cleaned = 0;
        
        sensitiveFiles.forEach(file => {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
                cleaned++;
                console.log(`🗑️  已删除: ${path.basename(file)}`);
            }
        });
        
        if (cleaned === 0) {
            console.log('ℹ️  没有找到需要清理的敏感文件');
        } else {
            console.log(`✅ 已清理 ${cleaned} 个敏感文件`);
        }
    }
}

// CLI 接口
async function promptPassword(prompt) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(prompt, (password) => {
            rl.close();
            resolve(password);
        });
    });
}

async function main() {
    const envManager = new EnvEncryption();
    const command = process.argv[2];

    console.log('🔐 MCP Hub 环境变量加密管理工具\n');

    switch (command) {
        case 'encrypt':
            const encryptPassword = await promptPassword('🔒 请输入加密密码: ');
            await envManager.encryptEnvFile(encryptPassword);
            break;

        case 'decrypt':
            const decryptPassword = await promptPassword('🔓 请输入解密密码: ');
            await envManager.decryptEnvFile(decryptPassword);
            break;

        case 'validate':
            envManager.validateEnvFile();
            break;

        case 'backup':
            envManager.createBackup();
            break;

        case 'cleanup':
            const confirm = await promptPassword('⚠️  确定要清理所有敏感文件吗？输入 "yes" 确认: ');
            if (confirm.toLowerCase() === 'yes') {
                envManager.cleanup();
            } else {
                console.log('❌ 操作已取消');
            }
            break;

        default:
            console.log(`
使用方法: node encrypt-env.js <command>

命令:
  encrypt    加密 .env.local 文件
  decrypt    解密环境变量文件到 .env.local
  validate   验证环境变量配置
  backup     创建环境变量备份
  cleanup    清理敏感文件

示例:
  node encrypt-env.js encrypt   # 加密环境变量
  node encrypt-env.js validate  # 验证配置
  node encrypt-env.js backup    # 创建备份
`);
            break;
    }
}

// 检查是否为直接运行
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
    main().catch(console.error);
}

export default EnvEncryption;