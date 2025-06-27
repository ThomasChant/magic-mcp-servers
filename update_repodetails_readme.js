#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const REPODETAILS_DIR = './public/data/repodetails';
const README_DIR = './public/data/readme';
const README_INDEX_FILE = './public/data/readme/index.json';

console.log('开始更新 repodetails 中的 readme 字段...');

// 读取 readme index
let readmeIndex = {};
if (fs.existsSync(README_INDEX_FILE)) {
    try {
        readmeIndex = JSON.parse(fs.readFileSync(README_INDEX_FILE, 'utf8'));
        console.log(`✓ 读取到 ${Object.keys(readmeIndex).length} 个 README 索引条目`);
    } catch (err) {
        console.warn(`⚠️ 无法读取 README 索引: ${err.message}`);
    }
} else {
    console.warn('⚠️ README 索引文件不存在');
}

// 获取所有 repodetails 文件
const repoDetailFiles = fs.readdirSync(REPODETAILS_DIR).filter(file => file.endsWith('.json'));
console.log(`发现 ${repoDetailFiles.length} 个 repodetails 文件`);

// 统计信息
let processedCount = 0;
let updatedCount = 0;
let errorCount = 0;
let notFoundCount = 0;

// 处理每个文件
for (const fileName of repoDetailFiles) {
    try {
        const filePath = path.join(REPODETAILS_DIR, fileName);
        
        // 读取 repodetails 文件
        const repoData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (!repoData.mcp_id) {
            console.warn(`⚠️ ${fileName} 缺少 mcp_id 字段`);
            errorCount++;
            continue;
        }

        // 查找对应的 README 文件
        let readmeContent = null;
        let serverId = null;

        // 方法1: 通过 README 索引查找
        for (const [id, info] of Object.entries(readmeIndex)) {
            if (info.project_name && repoData.mcp_id.includes(info.project_name)) {
                serverId = id;
                break;
            }
        }

        // 方法2: 如果索引中找不到，尝试直接通过文件名匹配
        if (!serverId) {
            const readmeFiles = fs.readdirSync(README_DIR).filter(file => file.endsWith('.json') && file !== 'index.json');
            
            for (const readmeFile of readmeFiles) {
                const readmeId = path.basename(readmeFile, '.json');
                if (readmeIndex[readmeId]) {
                    const readmeInfo = readmeIndex[readmeId];
                    if (readmeInfo.project_name && repoData.mcp_id.includes(readmeInfo.project_name)) {
                        serverId = readmeId;
                        break;
                    }
                }
            }
        }

        // 如果找到了对应的 README
        if (serverId) {
            const readmeFilePath = path.join(README_DIR, `${serverId}.json`);
            
            if (fs.existsSync(readmeFilePath)) {
                try {
                    const readmeData = JSON.parse(fs.readFileSync(readmeFilePath, 'utf8'));
                    
                    // 提取 README 内容为字符串
                    let readmeString = '';
                    
                    // 合并所有有内容的部分
                    if (readmeData.overview && readmeData.overview.content) {
                        readmeString += readmeData.overview.content + '\n\n';
                    }
                    
                    if (readmeData.installation && readmeData.installation.content) {
                        readmeString += readmeData.installation.content + '\n\n';
                    }
                    
                    if (readmeData.examples && readmeData.examples.content) {
                        readmeString += readmeData.examples.content + '\n\n';
                    }
                    
                    if (readmeData.api_reference && readmeData.api_reference.content) {
                        readmeString += readmeData.api_reference.content + '\n\n';
                    }

                    // 清理末尾的空行
                    readmeString = readmeString.trim();
                    
                    if (readmeString) {
                        // 更新 repodetails 文件的 readme 字段
                        const oldReadme = repoData.readme || '';
                        repoData.readme = readmeString;
                        
                        // 写回文件
                        fs.writeFileSync(filePath, JSON.stringify(repoData, null, 2), 'utf8');
                        
                        const changeStatus = oldReadme !== readmeString ? '更新' : '相同';
                        console.log(`✓ ${fileName} - README ${changeStatus} (${readmeString.length} 字符)`);
                        updatedCount++;
                    } else {
                        console.log(`⚠️ ${fileName} - README 内容为空`);
                        notFoundCount++;
                    }
                    
                } catch (err) {
                    console.error(`✗ 读取 README 文件失败 ${serverId}: ${err.message}`);
                    errorCount++;
                }
            } else {
                console.log(`⚠️ ${fileName} - README 文件不存在: ${serverId}`);
                notFoundCount++;
            }
        } else {
            console.log(`⚠️ ${fileName} - 未找到对应的 README (mcp_id: ${repoData.mcp_id})`);
            notFoundCount++;
        }
        
        processedCount++;
        
    } catch (error) {
        console.error(`✗ 处理文件失败 ${fileName}: ${error.message}`);
        errorCount++;
    }
}

console.log(`\n处理完成！`);
console.log(`- 总处理文件数: ${processedCount}`);
console.log(`- 成功更新: ${updatedCount}`);
console.log(`- 未找到 README: ${notFoundCount}`);
console.log(`- 错误: ${errorCount}`);