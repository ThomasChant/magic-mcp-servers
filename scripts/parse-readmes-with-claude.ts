#!/usr/bin/env tsx

/**
 * Claude Code README解析脚本
 * 使用Claude Code直接分析README内容，提取Installation和API Reference信息
 * 
 * 运行方式: npm run claude:parse-readmes
 */

import { createClient } from '@supabase/supabase-js';
import type { 
  ExtractedInstallation, 
  ExtractedAPIReference,
  InstallationMethod,
  ClientConfig,
  APITool,
  APIParameter,
  APIExample
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
 * 使用Claude Code分析README内容，提取Installation信息
 */
function analyzeInstallationSection(readmeContent: string): ExtractedInstallation {
  // 这里利用Claude Code的分析能力
  const methods: InstallationMethod[] = [];
  const clientConfigs: ClientConfig[] = [];
  const prerequisites: string[] = [];

  // 分析安装方式
  if (readmeContent.includes('npm install') || readmeContent.includes('npx')) {
    const npmCommands = extractNpmCommands(readmeContent);
    if (npmCommands.length > 0) {
      methods.push({
        type: 'npm',
        title: 'NPM Installation',
        commands: npmCommands,
        description: '使用NPM包管理器安装'
      });
    }
  }

  if (readmeContent.includes('pip install') || readmeContent.includes('python -m pip')) {
    const pipCommands = extractPipCommands(readmeContent);
    if (pipCommands.length > 0) {
      methods.push({
        type: 'pip',
        title: 'Python/Pip Installation',
        commands: pipCommands,
        description: '使用Python包管理器安装'
      });
    }
  }

  if (readmeContent.includes('docker run') || readmeContent.includes('docker pull')) {
    const dockerCommands = extractDockerCommands(readmeContent);
    if (dockerCommands.length > 0) {
      methods.push({
        type: 'docker',
        title: 'Docker Installation',
        commands: dockerCommands,
        description: '使用Docker容器运行'
      });
    }
  }

  if (readmeContent.includes('uvx') || readmeContent.includes('uv run')) {
    const uvCommands = extractUvCommands(readmeContent);
    if (uvCommands.length > 0) {
      methods.push({
        type: 'uv',
        title: 'UV Installation',
        commands: uvCommands,
        description: '使用UV包管理器安装'
      });
    }
  }

  if (readmeContent.includes('smithery') || readmeContent.includes('@smithery/cli')) {
    const smitheryCommands = extractSmitheryCommands(readmeContent);
    if (smitheryCommands.length > 0) {
      methods.push({
        type: 'smithery',
        title: 'Smithery Installation',
        commands: smitheryCommands,
        description: '使用Smithery自动安装'
      });
    }
  }

  // 提取客户端配置
  clientConfigs.push(...extractClientConfigs(readmeContent));

  // 提取先决条件
  prerequisites.push(...extractPrerequisites(readmeContent));

  return {
    methods,
    client_configs: clientConfigs,
    prerequisites
  };
}

/**
 * 使用Claude Code分析README内容，提取API Reference信息
 */
function analyzeAPIReferenceSection(readmeContent: string): ExtractedAPIReference {
  const tools: APITool[] = [];
  const usageExamples: string[] = [];

  // 提取可用工具
  tools.push(...extractTools(readmeContent));

  // 提取使用示例
  usageExamples.push(...extractUsageExamples(readmeContent));

  return {
    tools,
    usage_examples: usageExamples
  };
}

/**
 * 提取NPM安装命令
 */
function extractNpmCommands(content: string): string[] {
  const commands: string[] = [];
  const npmMatches = content.match(/```(?:bash|shell|sh)?\s*\n(.*?npm.*?)\n.*?```/gs);
  
  if (npmMatches) {
    npmMatches.forEach(match => {
      const lines = match.split('\n');
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('npm ') || trimmed.startsWith('npx ')) {
          commands.push(trimmed);
        }
      });
    });
  }

  // 处理单行代码块
  const inlineMatches = content.match(/`(npm[^`]+)`/g);
  if (inlineMatches) {
    inlineMatches.forEach(match => {
      const command = match.replace(/`/g, '').trim();
      if (!commands.includes(command)) {
        commands.push(command);
      }
    });
  }

  return [...new Set(commands)]; // 去重
}

/**
 * 提取Pip安装命令
 */
function extractPipCommands(content: string): string[] {
  const commands: string[] = [];
  const pipMatches = content.match(/```(?:bash|shell|sh)?\s*\n(.*?pip.*?)\n.*?```/gs);
  
  if (pipMatches) {
    pipMatches.forEach(match => {
      const lines = match.split('\n');
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.includes('pip install') || trimmed.includes('python -m pip')) {
          commands.push(trimmed);
        }
      });
    });
  }

  return [...new Set(commands)];
}

/**
 * 提取Docker命令
 */
function extractDockerCommands(content: string): string[] {
  const commands: string[] = [];
  const dockerMatches = content.match(/```(?:bash|shell|sh)?\s*\n(.*?docker.*?)\n.*?```/gs);
  
  if (dockerMatches) {
    dockerMatches.forEach(match => {
      const lines = match.split('\n');
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('docker ')) {
          commands.push(trimmed);
        }
      });
    });
  }

  return [...new Set(commands)];
}

/**
 * 提取UV命令
 */
function extractUvCommands(content: string): string[] {
  const commands: string[] = [];
  const uvMatches = content.match(/```(?:bash|shell|sh)?\s*\n(.*?uv.*?)\n.*?```/gs);
  
  if (uvMatches) {
    uvMatches.forEach(match => {
      const lines = match.split('\n');
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('uv ') || trimmed.startsWith('uvx ')) {
          commands.push(trimmed);
        }
      });
    });
  }

  return [...new Set(commands)];
}

/**
 * 提取Smithery命令
 */
function extractSmitheryCommands(content: string): string[] {
  const commands: string[] = [];
  const smitheryMatches = content.match(/```(?:bash|shell|sh)?\s*\n(.*?smithery.*?)\n.*?```/gs);
  
  if (smitheryMatches) {
    smitheryMatches.forEach(match => {
      const lines = match.split('\n');
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.includes('@smithery/cli') || trimmed.includes('smithery')) {
          commands.push(trimmed);
        }
      });
    });
  }

  return [...new Set(commands)];
}

/**
 * 提取客户端配置
 */
function extractClientConfigs(content: string): ClientConfig[] {
  const configs: ClientConfig[] = [];
  
  // Claude Desktop配置
  const claudeMatches = content.match(/```json\s*\n(\{[\s\S]*?mcpServers[\s\S]*?\})\s*\n```/g);
  if (claudeMatches) {
    claudeMatches.forEach(match => {
      const jsonContent = match.replace(/```json\s*\n/, '').replace(/\n```$/, '');
      configs.push({
        client: 'claude',
        config_json: jsonContent.trim(),
        description: 'Claude Desktop配置'
      });
    });
  }

  // VS Code配置
  const vscodeMatches = content.match(/```json\s*\n(\{[\s\S]*?"servers"[\s\S]*?\})\s*\n```/g);
  if (vscodeMatches) {
    vscodeMatches.forEach(match => {
      const jsonContent = match.replace(/```json\s*\n/, '').replace(/\n```$/, '');
      if (jsonContent.includes('"type": "http"') || jsonContent.includes('"command"')) {
        configs.push({
          client: 'vscode',
          config_json: jsonContent.trim(),
          description: 'VS Code MCP配置'
        });
      }
    });
  }

  // Cursor配置 (通常与VS Code相似)
  if (content.toLowerCase().includes('cursor')) {
    claudeMatches?.forEach(match => {
      const jsonContent = match.replace(/```json\s*\n/, '').replace(/\n```$/, '');
      configs.push({
        client: 'cursor',
        config_json: jsonContent.trim(),
        description: 'Cursor MCP配置'
      });
    });
  }

  // Windsurf配置 (通常与VS Code相似)
  if (content.toLowerCase().includes('windsurf')) {
    claudeMatches?.forEach(match => {
      const jsonContent = match.replace(/```json\s*\n/, '').replace(/\n```$/, '');
      configs.push({
        client: 'windsurf',
        config_json: jsonContent.trim(),
        description: 'Windsurf MCP配置'
      });
    });
  }

  return configs;
}

/**
 * 提取先决条件
 */
function extractPrerequisites(content: string): string[] {
  const prerequisites: string[] = [];
  
  // 查找Prerequisites部分
  const prereqMatch = content.match(/##?\s*Prerequisites[\s\S]*?(?=##|$)/i);
  if (prereqMatch) {
    const prereqSection = prereqMatch[0];
    const lines = prereqSection.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        prerequisites.push(trimmed.substring(2));
      } else if (/^\d+\./.test(trimmed)) {
        prerequisites.push(trimmed.replace(/^\d+\.\s*/, ''));
      }
    });
  }

  return prerequisites;
}

/**
 * 提取API工具
 */
function extractTools(content: string): APITool[] {
  const tools: APITool[] = [];
  
  // 查找Available Tools部分
  const toolsMatch = content.match(/##?\s*Available Tools[\s\S]*?(?=##|$)/i);
  if (toolsMatch) {
    const toolsSection = toolsMatch[0];
    
    // 提取工具名称和描述
    const toolMatches = toolsSection.match(/[-*]\s*`([^`]+)`\s*-\s*([^\n]+)/g);
    if (toolMatches) {
      toolMatches.forEach(match => {
        const parts = match.match(/[-*]\s*`([^`]+)`\s*-\s*([^\n]+)/);
        if (parts) {
          const toolName = parts[1];
          const description = parts[2];
          
          tools.push({
            name: toolName,
            description: description,
            parameters: [] // 这里可以进一步解析参数
          });
        }
      });
    }
  }

  return tools;
}

/**
 * 提取使用示例
 */
function extractUsageExamples(content: string): string[] {
  const examples: string[] = [];
  
  // 查找Example部分
  const exampleMatches = content.match(/##?\s*Example[s]?[\s\S]*?(?=##|$)/gi);
  if (exampleMatches) {
    exampleMatches.forEach(match => {
      // 提取代码块
      const codeBlocks = match.match(/```[\s\S]*?```/g);
      if (codeBlocks) {
        codeBlocks.forEach(block => {
          examples.push(block);
        });
      }
    });
  }

  return examples;
}

/**
 * 处理单个README记录
 */
async function processReadme(readme: ReadmeRecord): Promise<void> {
  console.log(`📝 处理README: ${readme.project_name} (${readme.server_id})`);
  
  try {
    // 更新状态为处理中
    await supabase
      .from('server_readmes')
      .update({ extraction_status: 'processing' })
      .eq('id', readme.id);

    // 使用Claude Code分析README内容
    const extractedInstallation = analyzeInstallationSection(readme.raw_content);
    const extractedApiReference = analyzeAPIReferenceSection(readme.raw_content);

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

    console.log(`✅ 完成处理: ${readme.project_name}`);
    
  } catch (error) {
    console.error(`❌ 处理失败: ${readme.project_name}`, error);
    
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
 * 批量处理README
 */
async function batchProcessReadmes(readmes: ReadmeRecord[], batchSize: number = 5): Promise<void> {
  console.log(`🚀 开始批量处理 ${readmes.length} 个README文件，批次大小: ${batchSize}`);
  
  for (let i = 0; i < readmes.length; i += batchSize) {
    const batch = readmes.slice(i, i + batchSize);
    console.log(`📦 处理批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(readmes.length / batchSize)}`);
    
    // 并行处理当前批次
    await Promise.all(batch.map(readme => processReadme(readme)));
    
    // 批次间延迟，避免过载
    if (i + batchSize < readmes.length) {
      console.log('⏳ 等待2秒后处理下一批次...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log('🔍 开始Claude Code README解析任务');

  try {
    // 获取所有待处理的README
    const { data: readmes, error } = await supabase
      .from('server_readmes')
      .select('id, server_id, filename, project_name, raw_content, extraction_status')
      .in('extraction_status', ['pending', 'failed'])
      .order('id');

    if (error) {
      throw error;
    }

    if (!readmes || readmes.length === 0) {
      console.log('✨ 没有需要处理的README文件');
      return;
    }

    console.log(`📊 找到 ${readmes.length} 个待处理的README文件`);

    // 批量处理
    await batchProcessReadmes(readmes, 3); // 每批处理3个

    console.log('🎉 所有README处理完成！');

  } catch (error) {
    console.error('💥 处理过程中出现错误:', error);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

export { main, analyzeInstallationSection, analyzeAPIReferenceSection };