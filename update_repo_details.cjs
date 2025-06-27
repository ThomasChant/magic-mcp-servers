#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REPO_DETAILS_DIR = '/Users/fanchen/AIProjects/mcp-servers/mcp-hub-react/public/data/repodetails';

function updateRepoDetailsFiles() {
    console.log('开始更新repodetails目录中的文件...');
    
    // 读取目录中的所有JSON文件
    const files = fs.readdirSync(REPO_DETAILS_DIR).filter(file => file.endsWith('.json'));
    
    console.log(`找到 ${files.length} 个JSON文件`);
    
    let processed = 0;
    let errors = 0;
    
    for (const filename of files) {
        const filePath = path.join(REPO_DETAILS_DIR, filename);
        
        try {
            // 读取文件内容
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);
            
            // 检查是否有repository.full_name字段
            if (!data.repository || !data.repository.full_name) {
                console.log(`⚠️ 跳过 ${filename}: 缺少repository.full_name字段`);
                continue;
            }
            
            // 获取repository.full_name并替换/为_
            const fullName = data.repository.full_name;
            const mcpId = fullName.replace('/', '_');
            
            // 更新mcp_id字段
            data.mcp_id = mcpId;
            
            // 创建新的文件名
            const newFilename = `${mcpId}.json`;
            const newFilePath = path.join(REPO_DETAILS_DIR, newFilename);
            
            // 写入更新后的内容
            fs.writeFileSync(newFilePath, JSON.stringify(data, null, 2), 'utf8');
            
            // 如果新文件名不同于原文件名，删除原文件
            if (filename !== newFilename) {
                fs.unlinkSync(filePath);
                console.log(`✓ 更新并重命名: ${filename} → ${newFilename} (mcp_id: ${mcpId})`);
            } else {
                console.log(`✓ 更新: ${filename} (mcp_id: ${mcpId})`);
            }
            
            processed++;
            
        } catch (error) {
            console.error(`✗ 处理文件 ${filename} 时出错:`, error.message);
            errors++;
        }
    }
    
    console.log(`\n处理完成！`);
    console.log(`- 成功处理: ${processed} 个文件`);
    console.log(`- 错误: ${errors} 个文件`);
}

// 执行更新
updateRepoDetailsFiles();