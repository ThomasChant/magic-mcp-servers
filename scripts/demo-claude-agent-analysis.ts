#!/usr/bin/env tsx

/**
 * Claude Code子代理README分析演示
 * 展示如何使用Task工具进行智能README分析
 * 
 * 运行方式: npm run claude:demo-agent-analysis
 */

import { createClient } from '@supabase/supabase-js';
import type { 
  ExtractedInstallation, 
  ExtractedAPIReference
} from '../src/types';

// Supabase配置（使用env文件或手动配置）
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';

// 演示README内容
const DEMO_README_CONTENT = `
# MCP Filesystem Server

A Model Context Protocol server providing secure filesystem operations for AI assistants.

## Features

- **Read files**: Safely read file contents with permission controls
- **List directories**: Browse directory structures  
- **Search files**: Find files by name or content
- **Write files**: Create and modify files (with safeguards)

## Installation

### Via npm
\`\`\`bash
npm install -g @modelcontextprotocol/server-filesystem
\`\`\`

### Via pip  
\`\`\`bash
pip install mcp-server-filesystem
\`\`\`

### Via Docker
\`\`\`bash
docker run -v /path/to/files:/workspace mcp/filesystem-server
\`\`\`

### Via UV
\`\`\`bash
uvx --from mcp-server-filesystem mcp-filesystem
\`\`\`

## Configuration

### Claude Desktop
Add to your \`claude_desktop_config.json\`:

\`\`\`json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"]
    }
  }
}
\`\`\`

### VS Code
Add to your MCP settings:

\`\`\`json
{
  "servers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}
\`\`\`

### Prerequisites
- Node.js 18+ or Python 3.8+
- Write permissions for target directories
- Valid file paths in allowed directories

### Environment Variables
- \`MCP_FILESYSTEM_ROOT\`: Base directory for operations (required)
- \`MCP_FILESYSTEM_READONLY\`: Set to "true" for read-only mode (optional)

## Available Tools

- \`read_file\` - Read contents of a file
- \`write_file\` - Write content to a file
- \`list_directory\` - List directory contents
- \`search_files\` - Search for files
- \`create_directory\` - Create new directories

## Usage Example

\`\`\`typescript
// Reading a file
await mcp.callTool("read_file", {
  path: "/workspace/example.txt"
});

// Writing a file  
await mcp.callTool("write_file", {
  path: "/workspace/output.txt",
  content: "Hello, World!"
});
\`\`\`

## API Reference

### read_file
- **path** (string, required): File path to read
- **encoding** (string, optional): File encoding, default 'utf-8'

### write_file  
- **path** (string, required): File path to write
- **content** (string, required): Content to write
- **encoding** (string, optional): File encoding, default 'utf-8'

### list_directory
- **path** (string, required): Directory path to list
- **recursive** (boolean, optional): List recursively, default false
`;

/**
 * 演示如何使用Claude Code子代理分析Installation信息
 */
async function demoInstallationAnalysis(readmeContent: string, projectName: string): Promise<ExtractedInstallation> {
  console.log(`\\n🤖 演示: Installation分析子代理 - ${projectName}`);
  console.log('📋 任务描述: 分析README并提取安装相关信息');
  
  // 在实际使用中，这里会调用Task工具
  // 这里我们返回之前Task工具分析的结果作为演示
  const mockResult: ExtractedInstallation = {
    methods: [
      {
        type: 'npm',
        title: 'Via npm',
        commands: ['npm install -g @modelcontextprotocol/server-filesystem'],
        description: '通过npm全局安装MCP文件系统服务器'
      },
      {
        type: 'pip',
        title: 'Via pip',
        commands: ['pip install mcp-server-filesystem'],
        description: '通过Python包管理器pip安装'
      },
      {
        type: 'docker',
        title: 'Via Docker',
        commands: ['docker run -v /path/to/files:/workspace mcp/filesystem-server'],
        description: '使用Docker容器运行，需要挂载本地文件目录到容器的/workspace路径'
      },
      {
        type: 'uv',
        title: 'Via UV',
        commands: ['uvx --from mcp-server-filesystem mcp-filesystem'],
        description: '通过UV工具直接运行'
      }
    ],
    client_configs: [
      {
        client: 'claude',
        config_json: JSON.stringify({
          mcpServers: {
            filesystem: {
              command: 'npx',
              args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/allowed/files']
            }
          }
        }, null, 2),
        config_path: 'claude_desktop_config.json',
        description: 'Claude Desktop配置，需要指定允许访问的文件路径'
      },
      {
        client: 'vscode',
        config_json: JSON.stringify({
          servers: {
            filesystem: {
              command: 'npx',
              args: ['-y', '@modelcontextprotocol/server-filesystem']
            }
          }
        }, null, 2),
        description: 'VS Code的MCP扩展配置'
      }
    ],
    prerequisites: [
      'Node.js 18+ 或 Python 3.8+',
      '目标目录的写入权限',
      '允许目录中的有效文件路径'
    ],
    environment_setup: [
      {
        name: 'MCP_FILESYSTEM_ROOT',
        value: '/path/to/base/directory',
        description: '文件系统操作的基础目录',
        required: true
      },
      {
        name: 'MCP_FILESYSTEM_READONLY',
        value: 'true',
        description: '设置为"true"以启用只读模式',
        required: false
      }
    ]
  };

  console.log('✅ Installation分析完成');
  console.log('📊 提取结果:');
  console.log(`   - 安装方法: ${mockResult.methods.length}个`);
  console.log(`   - 客户端配置: ${mockResult.client_configs.length}个`);
  console.log(`   - 先决条件: ${mockResult.prerequisites.length}个`);
  console.log(`   - 环境变量: ${mockResult.environment_setup?.length || 0}个`);

  return mockResult;
}

/**
 * 演示如何使用Claude Code子代理分析API Reference信息
 */
async function demoAPIReferenceAnalysis(readmeContent: string, projectName: string): Promise<ExtractedAPIReference> {
  console.log(`\\n🤖 演示: API Reference分析子代理 - ${projectName}`);
  console.log('📋 任务描述: 分析README并提取API相关信息');
  
  // 在实际使用中，这里会调用Task工具
  // 这里我们返回之前Task工具分析的结果作为演示
  const mockResult: ExtractedAPIReference = {
    tools: [
      {
        name: 'read_file',
        description: 'Read contents of a file',
        parameters: [
          {
            name: 'path',
            type: 'string',
            required: true,
            description: 'File path to read'
          },
          {
            name: 'encoding',
            type: 'string',
            required: false,
            description: 'File encoding',
            default: 'utf-8'
          }
        ],
        examples: [
          {
            title: 'Reading a file',
            description: 'Read contents from a text file',
            request: { path: '/workspace/example.txt' }
          }
        ]
      },
      {
        name: 'write_file',
        description: 'Write content to a file',
        parameters: [
          {
            name: 'path',
            type: 'string',
            required: true,
            description: 'File path to write'
          },
          {
            name: 'content',
            type: 'string',
            required: true,
            description: 'Content to write'
          },
          {
            name: 'encoding',
            type: 'string',
            required: false,
            description: 'File encoding',
            default: 'utf-8'
          }
        ],
        examples: [
          {
            title: 'Writing a file',
            description: 'Write content to a text file',
            request: {
              path: '/workspace/output.txt',
              content: 'Hello, World!'
            }
          }
        ]
      },
      {
        name: 'list_directory',
        description: 'List directory contents',
        parameters: [
          {
            name: 'path',
            type: 'string',
            required: true,
            description: 'Directory path to list'
          },
          {
            name: 'recursive',
            type: 'boolean',
            required: false,
            description: 'List recursively',
            default: 'false'
          }
        ]
      }
    ],
    usage_examples: [
      '// Reading a file\\nawait mcp.callTool("read_file", {\\n  path: "/workspace/example.txt"\\n});',
      '// Writing a file\\nawait mcp.callTool("write_file", {\\n  path: "/workspace/output.txt",\\n  content: "Hello, World!"\\n});'
    ],
    authentication: {
      type: 'none',
      description: 'No authentication required'
    }
  };

  console.log('✅ API Reference分析完成');
  console.log('📊 提取结果:');
  console.log(`   - 可用工具: ${mockResult.tools.length}个`);
  console.log(`   - 使用示例: ${mockResult.usage_examples?.length || 0}个`);
  console.log(`   - 配置选项: ${mockResult.configuration_options?.length || 0}个`);
  console.log(`   - 认证类型: ${mockResult.authentication?.type || 'none'}`);

  return mockResult;
}

/**
 * 演示数据保存到数据库
 */
async function demoSaveToDatabase(
  projectName: string, 
  _installation: ExtractedInstallation, 
  _apiReference: ExtractedAPIReference
): Promise<void> {
  console.log(`\\n💾 演示: 保存分析结果到数据库 - ${projectName}`);
  
  if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseServiceKey === 'YOUR_SUPABASE_KEY') {
    console.log('⚠️  Supabase配置不完整，跳过数据库操作');
    console.log('   请在.env.local文件中配置VITE_SUPABASE_URL和VITE_SUPABASE_ANON_KEY');
    return;
  }

  try {
    const _supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 模拟数据库更新操作
    console.log('📝 模拟数据库更新操作...');
    console.log('   - 更新extraction_status为"completed"');
    console.log('   - 保存extracted_installation数据');
    console.log('   - 保存extracted_api_reference数据');
    console.log('   - 设置extracted_at时间戳');
    
    console.log('✅ 数据库保存完成（模拟）');
    
  } catch (error) {
    console.error('❌ 数据库操作失败:', error);
  }
}

/**
 * 演示完整的Claude Code子代理分析流程
 */
async function demoCompleteAnalysisWorkflow(): Promise<void> {
  console.log('🚀 Claude Code子代理README分析演示');
  console.log('=' .repeat(60));
  
  const projectName = 'mcp-filesystem (演示)';
  
  try {
    // 步骤1: 并行创建两个分析子代理
    console.log('\\n📋 步骤1: 创建并行分析子代理');
    const [installationResult, apiReferenceResult] = await Promise.all([
      demoInstallationAnalysis(DEMO_README_CONTENT, projectName),
      demoAPIReferenceAnalysis(DEMO_README_CONTENT, projectName)
    ]);
    
    // 步骤2: 保存结果到数据库
    console.log('\\n📋 步骤2: 保存分析结果');
    await demoSaveToDatabase(projectName, installationResult, apiReferenceResult);
    
    // 步骤3: 显示完整结果摘要
    console.log('\\n📊 完整分析结果摘要:');
    console.log('=' .repeat(40));
    console.log('🔧 Installation信息:');
    installationResult.methods.forEach((method, index) => {
      console.log(`   ${index + 1}. ${method.title} (${method.type})`);
      console.log(`      命令: ${method.commands[0]}`);
    });
    
    console.log('\\n🔌 Client配置:');
    installationResult.client_configs.forEach((config, index) => {
      console.log(`   ${index + 1}. ${config.client}: ${config.description}`);
    });
    
    console.log('\\n🛠️  API工具:');
    apiReferenceResult.tools.forEach((tool, index) => {
      console.log(`   ${index + 1}. ${tool.name}: ${tool.description}`);
      console.log(`      参数: ${tool.parameters.length}个`);
    });
    
    console.log('\\n🎉 演示完成！');
    console.log('\\n💡 实际使用中，你可以:');
    console.log('   1. 调用Task工具创建真实的分析子代理');
    console.log('   2. 批量处理多个README文件');
    console.log('   3. 自动保存结果到Supabase数据库');
    console.log('   4. 在前端界面中展示结构化数据');
    
  } catch (error) {
    console.error('💥 演示过程中出现错误:', error);
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  await demoCompleteAnalysisWorkflow();
}

// 运行主函数
main().catch(console.error);

export { main };