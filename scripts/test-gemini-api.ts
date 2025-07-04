#!/usr/bin/env tsx

/**
 * Gemini API测试脚本
 * 测试Gemini API的连接和README分析功能
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Gemini API配置
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

if (!GEMINI_API_KEY) {
  console.error('❌ 缺少Gemini API配置: GEMINI_API_KEY');
  console.log('请在.env.local文件中添加: GEMINI_API_KEY=your_gemini_api_key');
  process.exit(1);
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * 测试Gemini API调用
 */
async function testGeminiAPI(): Promise<void> {
  console.log('🧪 测试Gemini API连接...\n');

  const testPrompt = `
你是一个专业的README文档分析师。请分析以下简单的README内容并提取安装信息。

# Test MCP Server

A simple test server for MCP protocol.

## Installation

Install via npm:
\`\`\`bash
npm install test-mcp-server
\`\`\`

Or using Docker:
\`\`\`bash
docker run -p 3000:3000 test/mcp-server
\`\`\`

## Configuration

Add to your Claude Desktop config:
\`\`\`json
{
  "mcpServers": {
    "test-server": {
      "command": "node",
      "args": ["test-mcp-server"]
    }
  }
}
\`\`\`

请返回JSON格式的安装信息。
`;

  try {
    console.log('📤 发送测试请求到Gemini API...');
    const startTime = Date.now();

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: testPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2000,
          topP: 0.8,
          topK: 10
        }
      })
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️  响应时间: ${duration}ms`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('API返回数据格式错误: 缺少candidates');
    }

    const result = data.candidates[0].content.parts[0].text;
    
    console.log('\n✅ Gemini API调用成功！');
    console.log('📄 返回内容预览:');
    console.log('-'.repeat(60));
    console.log(result.substring(0, 500) + '...');
    console.log('-'.repeat(60));

    // 尝试解析JSON
    try {
      const cleanedResponse = result
        .replace(/```json\s*\n?/g, '')
        .replace(/```\s*\n?/g, '')
        .trim();
      
      const parsedData = JSON.parse(cleanedResponse);
      console.log('\n✅ JSON解析成功！');
      console.log('📊 解析结果:', JSON.stringify(parsedData, null, 2));
    } catch (parseError) {
      console.log('\n⚠️  JSON解析失败，但API调用成功');
      console.log('原始响应可能需要更多清理处理');
    }

  } catch (error) {
    console.error('\n❌ Gemini API测试失败:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
    }
  }
}

/**
 * 测试Gemini API配额信息
 */
async function testGeminiQuota(): Promise<void> {
  console.log('\n\n🔍 检查Gemini API配额...');
  
  // Gemini API不直接提供配额查询接口
  // 但我们可以通过一个小请求来测试API是否正常工作
  
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello, please respond with "OK"'
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 10
        }
      })
    });

    if (response.ok) {
      console.log('✅ Gemini API密钥有效，可以正常使用');
      console.log('ℹ️  注意: Gemini免费版每分钟限制60次请求');
      console.log('ℹ️  建议在生产环境中实现请求速率限制');
    } else {
      console.log('❌ Gemini API密钥可能无效或达到配额限制');
    }
  } catch (error) {
    console.error('❌ 无法连接到Gemini API:', error);
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log('=' .repeat(80));
  console.log('🚀 Gemini API测试工具');
  console.log('=' .repeat(80));
  
  console.log('\n配置信息:');
  console.log(`API Key: ${GEMINI_API_KEY.substring(0, 10)}...`);
  console.log(`API URL: ${GEMINI_API_URL}`);
  
  // 运行测试
  await testGeminiAPI();
  await testGeminiQuota();
  
  console.log('\n' + '=' .repeat(80));
  console.log('✅ 所有测试完成！');
  console.log('=' .repeat(80));
}

// 运行主函数
main().catch((error) => {
  console.error('测试失败:', error);
  process.exit(1);
});