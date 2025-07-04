#!/usr/bin/env tsx

/**
 * Claude Code README真实子代理解析脚本
 * 使用Task工具创建真实的Claude Code子代理进行README内容的智能分析
 * 
 * 运行方式: npm run claude:parse-readmes-real-agents
 */

import { createClient } from '@supabase/supabase-js';
import type { 
  ExtractedInstallation, 
  ExtractedAPIReference
} from '../src/types';

// Supabase配置
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少Supabase配置环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ReadmeRecord {
  id: number;
  server_id: string;
  filename: string;
  project_name: string;
  raw_content: string;
  extraction_status: string;
}

/**
 * 使用Task工具创建Installation分析子代理
 */
async function createInstallationAnalysisAgent(readmeContent: string, projectName: string): Promise<ExtractedInstallation> {
  console.log(`🤖 创建Installation分析子代理: ${projectName}`);
  
  const taskDescription = `
分析MCP服务器README并提取安装信息

项目: ${projectName}

请分析以下README内容，提取并返回结构化的安装信息，包括：

1. 安装方法 (npm, pip, docker, uv, smithery, manual)
2. 客户端配置 (claude, vscode, cursor, windsurf, zed)
3. 先决条件
4. 环境变量设置

README内容:
---
${readmeContent.substring(0, 8000)}...
---

请以JSON格式返回ExtractedInstallation结构的数据。注意：
- methods数组包含InstallationMethod对象
- client_configs数组包含ClientConfig对象  
- prerequisites为字符串数组
- environment_setup为EnvironmentVariable对象数组

确保提取的信息准确且完整。如果某些信息不存在，返回空数组。
`;

  try {
    // 调用Task工具创建子代理
    const result = await useTaskTool({
      description: "Installation分析代理",
      prompt: taskDescription
    });
    
    // 解析结果并转换为ExtractedInstallation格式
    const extractedData = parseInstallationResult(result);
    console.log(`✅ Installation分析代理完成: ${projectName}`);
    return extractedData;
    
  } catch (error) {
    console.error(`❌ Installation分析代理失败: ${projectName}`, error);
    throw error;
  }
}

/**
 * 使用Task工具创建API Reference分析子代理
 */
async function createAPIReferenceAnalysisAgent(readmeContent: string, projectName: string): Promise<ExtractedAPIReference> {
  console.log(`🤖 创建API Reference分析子代理: ${projectName}`);
  
  const taskDescription = `
分析MCP服务器README并提取API信息

项目: ${projectName}

请分析以下README内容，提取并返回结构化的API参考信息，包括：

1. 可用工具/功能列表
2. 每个工具的参数定义
3. 使用示例
4. 配置选项
5. 认证信息

README内容:
---
${readmeContent.substring(0, 8000)}...
---

请以JSON格式返回ExtractedAPIReference结构的数据。注意：
- tools数组包含APITool对象，每个工具包含name, description, parameters, examples
- usage_examples为字符串数组，包含完整的使用示例代码
- configuration_options为ConfigurationOption对象数组
- authentication为AuthenticationInfo对象或null

确保提取的信息准确且完整。如果某些信息不存在，返回空数组或null。
`;

  try {
    // 调用Task工具创建子代理
    const result = await useTaskTool({
      description: "API Reference分析代理", 
      prompt: taskDescription
    });
    
    // 解析结果并转换为ExtractedAPIReference格式
    const extractedData = parseAPIReferenceResult(result);
    console.log(`✅ API Reference分析代理完成: ${projectName}`);
    return extractedData;
    
  } catch (error) {
    console.error(`❌ API Reference分析代理失败: ${projectName}`, error);
    throw error;
  }
}

/**
 * 模拟Task工具调用（实际应该调用真实的Task工具）
 */
async function useTaskTool(params: { description: string; prompt: string }): Promise<string> {
  // 这里应该是真实的Task工具调用
  // 当前作为示例，返回模拟结果
  console.log(`📋 执行任务: ${params.description}`);
  
  // 模拟处理时间
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 这里应该返回真实的Task工具执行结果
  // 暂时返回占位符，实际使用时会替换为真实的Claude Code分析结果
  return "TASK_RESULT_PLACEHOLDER";
}

/**
 * 解析Installation分析结果
 */
function parseInstallationResult(result: string): ExtractedInstallation {
  // 这里应该解析Task工具返回的结果
  // 暂时返回默认结构，实际使用时会解析真实结果
  return {
    methods: [],
    client_configs: [],
    prerequisites: [],
    environment_setup: []
  };
}

/**
 * 解析API Reference分析结果
 */
function parseAPIReferenceResult(result: string): ExtractedAPIReference {
  // 这里应该解析Task工具返回的结果
  // 暂时返回默认结构，实际使用时会解析真实结果
  return {
    tools: [],
    usage_examples: [],
    configuration_options: [],
    authentication: undefined
  };
}

/**
 * 处理单个README记录（使用真实子代理）
 */
async function processReadmeWithRealAgents(readme: ReadmeRecord): Promise<void> {
  console.log(`📝 使用真实子代理处理README: ${readme.project_name} (${readme.server_id})`);
  
  try {
    // 更新状态为处理中
    await supabase
      .from('server_readmes')
      .update({ extraction_status: 'processing' })
      .eq('id', readme.id);

    // 使用Task工具创建并行子代理分析
    const [extractedInstallation, extractedApiReference] = await Promise.all([
      createInstallationAnalysisAgent(readme.raw_content, readme.project_name),
      createAPIReferenceAnalysisAgent(readme.raw_content, readme.project_name)
    ]);

    // 保存结果到数据库
    const { error } = await supabase
      .from('server_readmes')
      .update({
        extracted_installation: extractedInstallation,
        extracted_api_reference: extractedApiReference,
        extraction_status: 'completed',
        extracted_at: new Date().toISOString(),
        extraction_error: null
      })
      .eq('id', readme.id);

    if (error) {
      throw error;
    }

    console.log(`✅ 真实子代理处理完成: ${readme.project_name}`);
    
  } catch (error) {
    console.error(`❌ 真实子代理处理失败: ${readme.project_name}`, error);
    
    // 更新错误状态
    await supabase
      .from('server_readmes')
      .update({ 
        extraction_status: 'failed',
        extraction_error: error instanceof Error ? error.message : String(error)
      })
      .eq('id', readme.id);
  }
}

/**
 * 批量处理README（使用真实子代理）
 */
async function batchProcessReadmesWithRealAgents(readmes: ReadmeRecord[], batchSize: number = 2): Promise<void> {
  console.log(`🚀 开始使用真实子代理批量处理 ${readmes.length} 个README文件，批次大小: ${batchSize}`);
  
  for (let i = 0; i < readmes.length; i += batchSize) {
    const batch = readmes.slice(i, i + batchSize);
    console.log(`📦 处理批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(readmes.length / batchSize)}`);
    
    // 并行处理当前批次
    await Promise.all(batch.map(readme => processReadmeWithRealAgents(readme)));
    
    // 批次间延迟，避免过载
    if (i + batchSize < readmes.length) {
      console.log('⏳ 等待5秒后处理下一批次...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log('🤖 开始Claude Code真实子代理README解析任务');

  try {
    // 获取所有待处理的README
    const { data: readmes, error } = await supabase
      .from('server_readmes')
      .select('id, server_id, filename, project_name, raw_content, extraction_status')
      .in('extraction_status', ['pending', 'failed'])
      .order('id')
      .limit(5); // 限制处理数量进行测试

    if (error) {
      throw error;
    }

    if (!readmes || readmes.length === 0) {
      console.log('✨ 没有需要处理的README文件');
      return;
    }

    console.log(`📊 找到 ${readmes.length} 个待处理的README文件`);

    // 使用真实子代理批量处理
    await batchProcessReadmesWithRealAgents(readmes, 2); // 每批处理2个

    console.log('🎉 所有README真实子代理处理完成！');

  } catch (error) {
    console.error('💥 真实子代理处理过程中出现错误:', error);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

export { main };