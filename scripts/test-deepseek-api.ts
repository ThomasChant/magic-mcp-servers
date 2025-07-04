#!/usr/bin/env tsx

/**
 * DeepSeek API连接测试脚本
 * 验证API配置是否正确，测试基本的API调用功能
 * 
 * 运行方式: npm run claude:test-deepseek
 */
import dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();
// DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 简单的日志工具
 */
class TestLogger {
  private static formatTime(): string {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  static info(message: string): void {
    console.log(`[${this.formatTime()}] ℹ️  ${message}`);
  }

  static success(message: string): void {
    console.log(`[${this.formatTime()}] ✅ ${message}`);
  }

  static error(message: string): void {
    console.error(`[${this.formatTime()}] ❌ ${message}`);
  }

  static warning(message: string): void {
    console.log(`[${this.formatTime()}] ⚠️  ${message}`);
  }
}

/**
 * 测试DeepSeek API连接
 */
async function testDeepSeekConnection(): Promise<void> {
  TestLogger.info('测试DeepSeek API连接...');

  if (!DEEPSEEK_API_KEY) {
    TestLogger.error('缺少DEEPSEEK_API_KEY环境变量');
    TestLogger.info('请在.env.local文件中设置: DEEPSEEK_API_KEY=your_api_key');
    TestLogger.info('获取API Key: https://platform.deepseek.com/api_keys');
    return;
  }

  TestLogger.info(`API密钥长度: ${DEEPSEEK_API_KEY.length}字符`);
  TestLogger.info(`API端点: ${DEEPSEEK_API_URL}`);
  const readmeContent = fs.readFileSync('README.md', 'utf-8');
  const testPrompt = `
请分析以下简单的README内容并提取安装信息，以JSON格式返回：

${readmeContent}

请返回JSON格式：
{
  "methods": [{"type": "npm", "title": "NPM Installation", "commands": ["npm install test-mcp-server"]}],
  "client_configs": [{"client": "claude", "config_json": "配置内容"}]
}
`;

  try {
    TestLogger.info('发送测试请求到DeepSeek API...');
    const startTime = Date.now();

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的README分析师，请严格按照JSON格式返回结果。'
          },
          {
            role: 'user',
            content: testPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    TestLogger.info(`API响应时间: ${duration}ms`);
    TestLogger.info(`HTTP状态码: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      TestLogger.error(`API请求失败: ${response.status} ${response.statusText}`);
      TestLogger.error(`错误详情: ${errorText}`);
      return;
    }

    const data: DeepSeekResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      TestLogger.error('API返回数据格式错误: 缺少choices');
      return;
    }

    const result = data.choices[0].message.content;
    TestLogger.success('API调用成功！');
    TestLogger.info(`响应长度: ${result.length}字符`);

    if (data.usage) {
      TestLogger.info(`Token使用情况:`);
      TestLogger.info(`  - 输入Tokens: ${data.usage.prompt_tokens}`);
      TestLogger.info(`  - 输出Tokens: ${data.usage.completion_tokens}`);
      TestLogger.info(`  - 总计Tokens: ${data.usage.total_tokens}`);
    }

    TestLogger.info('API返回内容:');
    console.log('=' .repeat(50));
    console.log(result);
    console.log('=' .repeat(50));

    // 尝试解析JSON
    try {
      const cleanedResponse = result
        .replace(/```json\s*\n?/g, '')
        .replace(/```\s*\n?/g, '')
        .trim();

      const parsedData = JSON.parse(cleanedResponse);
      TestLogger.success('JSON解析成功！');
      TestLogger.info('解析后的数据结构:');
      console.log(JSON.stringify(parsedData, null, 2));

    } catch (parseError) {
      TestLogger.warning('JSON解析失败，但API调用成功');
      TestLogger.warning('原始响应可能需要额外清理');
    }

  } catch (error) {
    TestLogger.error(`API测试失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log('\n🔍 DeepSeek API连接测试');
  console.log('=' .repeat(60));
  
  await testDeepSeekConnection();
  
  console.log('=' .repeat(60));
  console.log('测试完成\n');
}

// 运行测试
main().catch((error) => {
  TestLogger.error('测试执行失败', error);
  process.exit(1);
});

export { main };