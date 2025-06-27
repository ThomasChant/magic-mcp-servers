#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const EXTENDED_FILE = './public/data/servers-extended.json';
const README_INDEX_FILE = './public/data/readme/index.json';
const OUTPUT_DIR = './public/data/server-details';

// 创建输出目录
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('开始拆分和合并extended数据...');

// 读取servers-extended.json
const extendedData = JSON.parse(fs.readFileSync(EXTENDED_FILE, 'utf8'));

// 读取readme index
const readmeIndex = JSON.parse(fs.readFileSync(README_INDEX_FILE, 'utf8'));

// 统计信息
let processedCount = 0;
let errorCount = 0;
let missingReadmeCount = 0;

// 处理每个server
for (const [serverId, extendedInfo] of Object.entries(extendedData)) {
    try {
        // 从repository信息获取owner和name
        const repoUrl = extendedInfo.repository?.url;
        if (!repoUrl) {
            console.warn(`⚠️ 服务器 ${serverId} 缺少repository URL`);
            errorCount++;
            continue;
        }

        // 从URL中提取owner和repo name
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?]+)/);
        if (!match) {
            console.warn(`⚠️ 无法从URL提取信息: ${repoUrl}`);
            errorCount++;
            continue;
        }

        const owner = match[1];
        const repoName = match[2].replace(/\.git$/, ''); // 移除可能的.git后缀
        const fileName = `${owner}_${repoName}.json`;

        // 创建合并的数据对象
        const mergedData = {
            id: serverId,
            owner: owner,
            repoName: repoName,
            ...extendedInfo
        };

        // 查找对应的readme数据
        const readmeInfo = readmeIndex[serverId];
        if (readmeInfo) {
            // 读取完整的readme数据
            const readmeFile = path.join('./public/data/readme', `${serverId}.json`);
            if (fs.existsSync(readmeFile)) {
                try {
                    const readmeData = JSON.parse(fs.readFileSync(readmeFile, 'utf8'));
                    mergedData.readme = readmeData;
                    console.log(`✓ 合并README数据: ${fileName}`);
                } catch (err) {
                    console.error(`✗ 读取README文件失败 ${serverId}: ${err.message}`);
                    mergedData.readme = null;
                }
            } else {
                console.log(`⚠️ README文件不存在: ${serverId}`);
                mergedData.readme = null;
                missingReadmeCount++;
            }
        } else {
            console.log(`⚠️ README索引中没有找到: ${serverId}`);
            mergedData.readme = null;
            missingReadmeCount++;
        }

        // 写入新文件
        const outputPath = path.join(OUTPUT_DIR, fileName);
        fs.writeFileSync(outputPath, JSON.stringify(mergedData, null, 2), 'utf8');
        processedCount++;
        
        console.log(`✓ 创建文件: ${fileName}`);

    } catch (error) {
        console.error(`✗ 处理 ${serverId} 时出错:`, error.message);
        errorCount++;
    }
}

console.log(`\n处理完成！`);
console.log(`- 成功处理: ${processedCount} 个服务器`);
console.log(`- 缺少README: ${missingReadmeCount} 个`);
console.log(`- 错误: ${errorCount} 个`);
console.log(`- 输出目录: ${OUTPUT_DIR}`);

// 创建索引文件，方便查找
const indexData = {};
for (const [serverId, extendedInfo] of Object.entries(extendedData)) {
    const repoUrl = extendedInfo.repository?.url;
    if (repoUrl) {
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?]+)/);
        if (match) {
            const owner = match[1];
            const repoName = match[2].replace(/\.git$/, '');
            indexData[serverId] = {
                owner: owner,
                repoName: repoName,
                fileName: `${owner}_${repoName}.json`
            };
        }
    }
}

// 写入索引文件
fs.writeFileSync(
    path.join(OUTPUT_DIR, 'index.json'),
    JSON.stringify(indexData, null, 2),
    'utf8'
);
console.log(`✓ 创建索引文件: index.json`);