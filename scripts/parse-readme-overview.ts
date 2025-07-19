#!/usr/bin/env tsx

/**
 * AI README智能解析脚本
 * 使用DeepSeek或Gemini API进行README内容的智能分析和结构化提取
 * 自动从GitHub获取缺失的README内容，每完成一个分析就立即保存到数据库，并提供详细的日志记录
 * 
 * 环境变量配置:
 * - DEEPSEEK_API_KEY: DeepSeek API密钥（必需）
 * - GITHUB_TOKEN: GitHub Personal Access Token（推荐，提高API限制）
 * - VITE_SUPABASE_URL: Supabase项目URL（必需）
 * - SUPABASE_SERVICE_ROLE_KEY: Supabase服务角色密钥（必需）
 * 
 * GitHub API限制:
 * - 无Token: 60次请求/小时
 * - 有Token: 5000次请求/小时
 * 
 * 运行方式: 
 * npm run claude:parse-readmes-ai -- --overview     # 只提取Overview
 * npm run claude:parse-readmes-ai -- --installation # 只提取Installation
 * npm run claude:parse-readmes-ai -- --api          # 只提取API Reference
 * npm run claude:parse-readmes-ai -- --all          # 提取所有内容（默认）
 */

import { createClient } from '@supabase/supabase-js';
import type { 
  ExtractedInstallation, 
  ExtractedAPIReference
} from '../src/types';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({path: join(__dirname, '../.env.local')});

// Parse command line arguments
const args = process.argv.slice(2);

// Check for help flag
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
AI README智能解析脚本使用说明:

命令选项:
  --overview, -o      只提取Overview部分
  --installation, -i  只提取Installation部分
  --api, -a          只提取API Reference部分
  --all              提取所有部分（默认）
  --help, -h         显示此帮助信息

环境变量配置:
  DEEPSEEK_API_KEY    DeepSeek API密钥（必需）
  GITHUB_TOKEN        GitHub Personal Access Token（推荐）
  VITE_SUPABASE_URL   Supabase项目URL（必需）
  SUPABASE_SERVICE_ROLE_KEY  Supabase服务密钥（必需）

GitHub API限制:
  无Token: 60次请求/小时    (适合小规模测试)
  有Token: 5000次请求/小时  (推荐用于生产环境)

使用示例:
  npm run claude:parse-readmes-ai -- --overview        # 只提取Overview
  npm run claude:parse-readmes-ai -- --installation    # 只提取Installation
  npm run claude:parse-readmes-ai -- --api             # 只提取API Reference
  npm run claude:parse-readmes-ai -- --overview --api  # 提取Overview和API Reference
  npm run claude:parse-readmes-ai -- --all             # 提取所有内容
  npm run claude:parse-readmes-ai                      # 默认提取所有内容

注意: 脚本会自动从GitHub获取缺失的README内容，建议配置GitHub Token以提高API限制。
`);
  process.exit(0);
}

const extractionMode = {
  overview: args.includes('--overview') || args.includes('-o'),
  installation: args.includes('--installation') || args.includes('-i'),
  api: args.includes('--api') || args.includes('-a'),
  all: args.includes('--all')
};

// If no specific mode is selected, default to 'all'
if (!extractionMode.overview && !extractionMode.installation && !extractionMode.api && !extractionMode.all) {
  extractionMode.all = true;
}

// If 'all' is selected, enable all modes
if (extractionMode.all) {
  extractionMode.overview = true;
  extractionMode.installation = true;
  extractionMode.api = true;
}

// Get directory of the current module

// Define ExtractedOverview interface
interface ExtractedOverview {
  introduction: {
    title: string;
    summary: string;
    motivation: string;
    core_functionality: string;
    key_features: string[];
    use_cases: Array<{
      scenario: string;
      description: string;
    }>;
    unique_value: string;
  };
}

// API模型枚举
enum AIModel {
  DEEPSEEK = 'deepseek',
  GEMINI = 'gemini'
}

// DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// GitHub API配置
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Supabase配置
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// 检查API配置
const hasDeepSeek = !!DEEPSEEK_API_KEY;
const hasGitHubToken = !!GITHUB_TOKEN;

if (!hasDeepSeek) {
  console.error('❌ 缺少AI API配置: 至少需要配置DEEPSEEK_API_KEY');
  console.log('请在.env.local文件中添加:');
  console.log('  DEEPSEEK_API_KEY=your_deepseek_api_key');
  process.exit(1);
}

if (!hasGitHubToken) {
  console.warn('⚠️  未配置GitHub Token，将使用较低的API限制');
  console.log('推荐在.env.local文件中添加:');
  console.log('  GITHUB_TOKEN=your_github_token');
  console.log('GitHub Token提供更高的API限制: 5000次/小时 vs 60次/小时');
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少Supabase配置环境变量');
  console.log('请在.env.local文件中添加: VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 统计API使用情况
const apiUsageStats = {
  deepseek: { attempts: 0, successes: 0, failures: 0 },
  gemini: { attempts: 0, successes: 0, failures: 0 }
};

interface ReadmeRecord {
  id: number;
  server_id: string;
  filename: string;
  project_name: string;
  raw_content: string;
  extraction_status: string;
}

// Interface for server record (used for GitHub URL fetching)
// interface ServerRecord {
//   id: string;
//   github_url: string;
//   name: string;
// }

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * 日志记录工具
 */
class Logger {
  private static formatTime(): string {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  static info(message: string, data?: unknown): void {
    console.log(`[${this.formatTime()}] ℹ️  INFO: ${message}`);
    if (data) {
      console.log(`[${this.formatTime()}] 📄 DATA:`, JSON.stringify(data, null, 2));
    }
  }

  static success(message: string, data?: unknown): void {
    console.log(`[${this.formatTime()}] ✅ SUCCESS: ${message}`);
    if (data) {
      console.log(`[${this.formatTime()}] 📄 DATA:`, JSON.stringify(data, null, 2));
    }
  }

  static warning(message: string, data?: unknown): void {
    console.log(`[${this.formatTime()}] ⚠️  WARNING: ${message}`);
    if (data) {
      console.log(`[${this.formatTime()}] 📄 DATA:`, JSON.stringify(data, null, 2));
    }
  }

  static error(message: string, error?: unknown): void {
    console.error(`[${this.formatTime()}] ❌ ERROR: ${message}`);
    if (error) {
      if (error instanceof Error) {
        console.error(`[${this.formatTime()}] 💥 ERROR_DETAILS: ${error.message}`);
        console.error(`[${this.formatTime()}] 📍 STACK_TRACE:`, error.stack);
      } else if (typeof error === 'object') {
        try {
          console.error(`[${this.formatTime()}] 💥 ERROR_DETAILS:`, JSON.stringify(error, null, 2));
        } catch {
          console.error(`[${this.formatTime()}] 💥 ERROR_DETAILS:`, String(error));
        }
      } else {
        console.error(`[${this.formatTime()}] 💥 ERROR_DETAILS:`, String(error));
      }
    }
  }

  static progress(current: number, total: number, message: string): void {
    const percentage = Math.round((current / total) * 100);
    const progressBar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
    console.log(`[${this.formatTime()}] 📊 PROGRESS: [${progressBar}] ${percentage}% (${current}/${total}) - ${message}`);
  }
}

/**
 * GitHub README获取工具
 */
class GitHubReadmeFetcher {
  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 从GitHub URL提取仓库信息和路径
   */
  private static parseGithubUrl(githubUrl: string): { owner: string; repo: string; path?: string; branch?: string } | null {
    try {
      // 支持多种GitHub URL格式，包括子目录路径
      const patterns = [
        // https://github.com/owner/repo/tree/branch/path/to/folder
        /github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)/,
        // https://github.com/owner/repo/blob/branch/path/to/file (提取目录部分)
        /github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/,
        // https://github.com/owner/repo/tree/branch
        /github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/?$/,
        // https://github.com/owner/repo.git
        /github\.com\/([^/]+)\/([^/]+?)\.git\/?$/,
        // https://github.com/owner/repo
        /github\.com\/([^/]+)\/([^/]+?)\/?$/
      ];

      for (const pattern of patterns) {
        const match = githubUrl.match(pattern);
        if (match) {
          const [, owner, repo, branch, path] = match;
          
          // 清理仓库名称，移除可能的 .git 后缀
          const cleanRepo = repo.replace(/\.git$/, '');
          
          const result: { owner: string; repo: string; path?: string; branch?: string } = {
            owner,
            repo: cleanRepo
          };
          
          if (branch) {
            result.branch = branch;
          }
          
          if (path) {
            // 处理不同类型的GitHub URL
            if (githubUrl.includes('/blob/')) {
              // blob URL可能指向文件或目录
              // 检查最后一个部分是否看起来像文件名（有扩展名）
              const pathParts = path.split('/');
              const lastPart = pathParts[pathParts.length - 1];
              
              // 如果最后部分有文件扩展名，则认为是文件，提取目录部分
              if (lastPart.includes('.') && /\.[a-zA-Z0-9]+$/.test(lastPart)) {
                pathParts.pop(); // 移除文件名
                if (pathParts.length > 0) {
                  result.path = pathParts.join('/');
                }
                // 如果移除文件名后没有路径了，就不设置path
              } else {
                // 最后部分没有扩展名，可能是目录名，保持原样
                result.path = path;
              }
            } else {
              // tree URL或其他类型，直接使用路径
              result.path = path;
            }
          }
          
          Logger.info(`解析GitHub URL成功`, {
            url: githubUrl,
            owner,
            repo: cleanRepo,
            branch: branch || 'main',
            path: path || '根目录'
          });
          
          return result;
        }
      }

      Logger.warning(`无法解析GitHub URL: ${githubUrl}`);
      return null;
    } catch (error) {
      Logger.error(`GitHub URL解析错误: ${githubUrl}`, error);
      return null;
    }
  }

  /**
   * 从GitHub仓库获取README内容
   */
  static async fetchReadmeContent(githubUrl: string, retries: number = 3): Promise<string> {
    Logger.info(`开始获取GitHub README: ${githubUrl}`, {
      authenticated: !!GITHUB_TOKEN,
      rateLimit: GITHUB_TOKEN ? '5000 requests/hour' : '60 requests/hour'
    });

    const repoInfo = this.parseGithubUrl(githubUrl);
    if (!repoInfo) {
      throw new Error(`无效的GitHub URL: ${githubUrl}`);
    }

    const { owner, repo, path, branch } = repoInfo;
    const targetBranch = branch || 'main';
    const targetPath = path || '';
    
    // 尝试不同的README文件名
    const readmeFilenames = ['README.md', 'readme.md', 'Readme.md', 'README.rst', 'README.txt'];
    
    Logger.info(`GitHub仓库信息`, {
      owner,
      repo,
      branch: targetBranch,
      path: targetPath || '根目录',
      willSearchIn: targetPath ? `${targetPath}/` : '根目录'
    });
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        Logger.info(`尝试获取README (第${attempt}次)`, { owner, repo, attempt, retries });

        // 尝试每个可能的README文件名
        for (const filename of readmeFilenames) {
          try {
            // 构建文件路径，如果有子目录路径则包含进去
            const filePath = targetPath ? `${targetPath}/${filename}` : filename;
            const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
            
            Logger.info(`尝试获取文件: ${filename}`, { 
              apiUrl,
              filePath,
              targetPath: targetPath || '根目录'
            });

            // 构建请求头
            const headers: Record<string, string> = {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'MCP-Hub-README-Parser/1.0'
            };

            // 如果有GitHub Token，添加授权头
            if (GITHUB_TOKEN) {
              headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
            }

            const response = await fetch(apiUrl, { headers });

            if (response.status === 404) {
              Logger.info(`文件不存在: ${filename}`);
              continue; // 尝试下一个文件名
            }

            if (!response.ok) {
              const errorText = await response.text();
              
              // 特殊处理不同类型的错误
              if (response.status === 403) {
                try {
                  const errorData = JSON.parse(errorText);
                  if (errorData.message?.includes('rate limit exceeded')) {
                    Logger.warning(`GitHub API速率限制`, {
                      status: response.status,
                      authenticated: !!GITHUB_TOKEN,
                      resetTime: response.headers.get('X-RateLimit-Reset'),
                      remaining: response.headers.get('X-RateLimit-Remaining'),
                      limit: response.headers.get('X-RateLimit-Limit')
                    });
                  } else if (errorData.message?.includes('Bad credentials')) {
                    Logger.error(`GitHub Token验证失败`, {
                      status: response.status,
                      message: 'GitHub Token可能无效或已过期'
                    });
                  }
                } catch {
                  // 如果无法解析错误，使用通用处理
                }
              }
              
              Logger.warning(`GitHub API响应错误: ${response.status}`, {
                status: response.status,
                statusText: response.statusText,
                authenticated: !!GITHUB_TOKEN,
                error: errorText.substring(0, 500) // 限制错误信息长度
              });
              continue; // 尝试下一个文件名
            }

            const data = await response.json();
            
            if (!data.content) {
              Logger.warning(`GitHub API返回的数据中没有content字段`, { filename, data });
              continue;
            }

            // GitHub API返回base64编码的内容
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            
            Logger.success(`成功获取README内容`, {
              owner,
              repo,
              filename,
              contentLength: content.length,
              attempt
            });

            return content;

          } catch (error) {
            Logger.warning(`获取文件失败: ${filename}`, error);
            continue; // 尝试下一个文件名
          }
        }

        // 如果所有文件名都失败了，且不是最后一次尝试，则等待后重试
        if (attempt < retries) {
          const delayMs = Math.pow(2, attempt) * 1000; // 指数退避
          Logger.warning(`所有README文件名都失败，等待${delayMs}ms后重试...`);
          await this.delay(delayMs);
        }

      } catch (error) {
        Logger.error(`第${attempt}次尝试失败`, error);
        
        if (attempt < retries) {
          const delayMs = Math.pow(2, attempt) * 1000;
          Logger.warning(`等待${delayMs}ms后重试...`);
          await this.delay(delayMs);
        }
      }
    }

    throw new Error(`无法从GitHub获取README内容: ${githubUrl} (已尝试${retries}次)`);
  }
}

/**
 * 基础API客户端类
 */
abstract class AIAPIClient {
  protected abstract modelType: AIModel;
  
  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  abstract callAPI(prompt: string, retries?: number, timeoutMs?: number): Promise<string>;
}

/**
 * DeepSeek API调用工具
 */
class DeepSeekAPI extends AIAPIClient {
  protected modelType = AIModel.DEEPSEEK;

  async callAPI(prompt: string, retries: number = 3, timeoutMs: number = 30000): Promise<string> {
    apiUsageStats.deepseek.attempts++;
    
    Logger.info('调用DeepSeek API', { 
      promptLength: prompt.length,
      retries: retries,
      timeoutMs: timeoutMs
    });

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        Logger.info(`API调用尝试 ${attempt}/${retries}`);

        // 创建超时控制器
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          Logger.warning(`API调用超时 (${timeoutMs}ms), 尝试 ${attempt}/${retries}`);
        }, timeoutMs);

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
                content: '你是一个专业的README文档分析师，擅长从技术文档中提取结构化信息。请严格按照要求的JSON格式返回结果。'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.1,
            max_tokens: 4000
          }),
          signal: controller.signal
        });

        // 清除超时
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data: DeepSeekResponse = await response.json();
        
        if (!data.choices || data.choices.length === 0) {
          throw new Error('API返回数据格式错误: 缺少choices');
        }

        const result = data.choices[0].message.content;
        Logger.success(`API调用成功 (尝试 ${attempt}/${retries})`, {
          responseLength: result.length,
          responsePreview: result.substring(0, 200) + '...'
        });

        apiUsageStats.deepseek.successes++;
        return result;

      } catch (error) {
        // 特殊处理超时错误
        if (error instanceof Error && error.name === 'AbortError') {
          Logger.error(`API调用超时 (尝试 ${attempt}/${retries})`, `超时时间: ${timeoutMs}ms`);
        } else {
          Logger.error(`API调用失败 (尝试 ${attempt}/${retries})`, error);
        }
        
        if (attempt < retries) {
          const delayMs = Math.pow(2, attempt) * 1000; // 指数退避
          Logger.warning(`等待 ${delayMs}ms 后重试...`);
          await this.delay(delayMs);
        } else {
          apiUsageStats.deepseek.failures++;
          if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(`API调用超时，已重试 ${retries} 次，每次超时 ${timeoutMs}ms`);
          } else {
            throw new Error(`API调用失败，已重试 ${retries} 次: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }
    }

    apiUsageStats.deepseek.failures++;
    throw new Error('API调用失败');
  }
}


/**
 * 随机选择API
 */
function selectRandomAPI(): AIAPIClient {
  const availableAPIs: AIAPIClient[] = [];
  
  if (hasDeepSeek) {
    availableAPIs.push(new DeepSeekAPI());
  }
  
  
  if (availableAPIs.length === 0) {
    throw new Error('没有可用的API');
  }
  
  // 随机选择一个API
  const randomIndex = Math.floor(Math.random() * availableAPIs.length);
  const selectedAPI = availableAPIs[randomIndex];
  
  Logger.info(`随机选择API: ${selectedAPI['modelType']}`, {
    availableAPIs: availableAPIs.map(api => api['modelType']),
    selectedIndex: randomIndex
  });
  
  return selectedAPI;
}

/**
 * 使用AI分析README，提取Installation信息（支持DeepSeek和Gemini）
 */
async function analyzeInstallationWithAI(readmeContent: string, projectName: string): Promise<ExtractedInstallation> {
  const apiClient = selectRandomAPI();
  Logger.info(`开始分析Installation信息: ${projectName} (使用${apiClient['modelType']})`);
  
  const prompt = `
请分析以下MCP服务器项目的README内容，并提取安装相关的结构化信息。

项目名称: ${projectName}

任务说明：
从README中提取以下信息，并以严格的JSON格式返回，不要包含任何其他文本：

1. **安装方法** (methods): 识别不同的安装方式
   - npm: npm install命令
   - pip: pip install命令  
   - docker: Docker相关命令
   - uv: uv/uvx命令
   - smithery: smithery安装
   - manual: 手动安装步骤

2. **客户端配置** (client_configs): 针对不同AI客户端的配置
   - claude: Claude Desktop配置
   - vscode: VS Code配置
   - cursor: Cursor配置
   - windsurf: Windsurf配置
   - zed: Zed配置

3. **先决条件** (prerequisites): 安装前需要的条件
4. **环境变量** (environment_setup): 需要设置的环境变量

请返回严格的JSON格式，不要包含markdown代码块标记：
{
  "methods": [
    {
      "type": "npm|pip|docker|uv|smithery|manual",
      "title": "安装方法标题",
      "commands": ["具体命令"],
      "description": "描述",
      "platform": "macos|windows|linux|all"
    }
  ],
  "client_configs": [
    {
      "client": "claude|vscode|cursor|windsurf|zed",
      "config_json": "JSON配置内容",
      "config_path": "配置文件路径",
      "description": "配置说明",
      "notes": "注意事项"
    }
  ],
  "prerequisites": ["先决条件1", "先决条件2"],
  "environment_setup": [
    {
      "name": "环境变量名",
      "value": "示例值",
      "description": "变量说明",
      "required": true|false
    }
  ]
}

README内容:
---
${readmeContent.substring(0, 32000)}
---

请仔细分析并提取所有相关的安装信息。如果某些信息不存在，请返回空数组。
`;

  try {
    const response = await apiClient.callAPI(prompt);
    
    // 使用强化的JSON解析
    const fallbackInstallation: ExtractedInstallation = {
      methods: [],
      client_configs: [],
      prerequisites: [],
      environment_setup: []
    };
    
    const extractedData = parseAIResponse<ExtractedInstallation>(
      response, 
      apiClient['modelType'], 
      fallbackInstallation
    );
    
    // 验证数据结构
    if (!extractedData.methods) extractedData.methods = [];
    if (!extractedData.client_configs) extractedData.client_configs = [];
    if (!extractedData.prerequisites) extractedData.prerequisites = [];
    if (!extractedData.environment_setup) extractedData.environment_setup = [];

    Logger.success(`Installation分析完成: ${projectName} (${apiClient['modelType']})`, {
      methodsCount: extractedData.methods.length,
      clientConfigsCount: extractedData.client_configs.length,
      prerequisitesCount: extractedData.prerequisites.length,
      environmentSetupCount: extractedData.environment_setup.length
    });

    return extractedData;

  } catch (error) {
    Logger.error(`Installation分析失败: ${projectName} (${apiClient['modelType']})`, error);
    
    // 返回空的结构而不是抛出错误
    Logger.warning(`返回空的Installation结构: ${projectName}`);
    return {
      methods: [],
      client_configs: [],
      prerequisites: [],
      environment_setup: []
    };
  }
}

/**
 * 使用AI分析README，提取Overview信息
 */
async function analyzeOverviewWithAI(readmeContent: string, projectName: string): Promise<ExtractedOverview> {
  const apiClient = selectRandomAPI();
  Logger.info(`开始分析Overview信息: ${projectName} (使用${apiClient['modelType']})`);
  
  // 读取prompt模板
  let promptTemplate: string;
  try {
    promptTemplate = readFileSync(join(__dirname, 'extract-readme-overview-prompt-intro.txt'), 'utf-8');
  } catch (error) {
    Logger.error('无法读取prompt模板文件', error);
    throw new Error('无法读取extract-readme-overview-prompt-intro.txt文件');
  }
  
  // 替换模板中的占位符
  const prompt = promptTemplate.replace('{readmeContent}', readmeContent.substring(0, 12000));

  try {
    const response = await apiClient.callAPI(prompt);
    
    // 使用强化的JSON解析
    const fallbackOverview: ExtractedOverview = {
      introduction: {
        title: '',
        summary: '',
        motivation: '',
        core_functionality: '',
        key_features: [],
        use_cases: [],
        unique_value: ''
      }
    };
    
    const extractedData = parseAIResponse<ExtractedOverview>(
      response, 
      apiClient['modelType'], 
      fallbackOverview
    );
    
    // 验证数据结构
    if (!extractedData.introduction) {
      extractedData.introduction = fallbackOverview.introduction;
    }
    if (!extractedData.introduction.key_features) {
      extractedData.introduction.key_features = [];
    }
    if (!extractedData.introduction.use_cases) {
      extractedData.introduction.use_cases = [];
    }

    Logger.success(`Overview分析完成: ${projectName} (${apiClient['modelType']})`, {
      title: extractedData.introduction.title,
      keyFeaturesCount: extractedData.introduction.key_features.length,
      useCasesCount: extractedData.introduction.use_cases.length
    });

    return extractedData;

  } catch (error) {
    Logger.error(`Overview分析失败: ${projectName} (${apiClient['modelType']})`, error);
    
    // 返回空的结构而不是抛出错误
    Logger.warning(`返回空的Overview结构: ${projectName}`);
    return {
      introduction: {
        title: '',
        summary: '',
        motivation: '',
        core_functionality: '',
        key_features: [],
        use_cases: [],
        unique_value: ''
      }
    };
  }
}

/**
 * 使用AI分析README，提取API Reference信息（支持DeepSeek和Gemini）
 */
async function analyzeAPIReferenceWithAI(readmeContent: string, projectName: string): Promise<ExtractedAPIReference> {
  const apiClient = selectRandomAPI();
  Logger.info(`开始分析API Reference信息: ${projectName} (使用${apiClient['modelType']})`);
  
  const prompt = `
请分析以下MCP服务器项目的README内容，并提取API相关的结构化信息。

项目名称: ${projectName}

任务说明：
从README中提取以下信息，并以严格的JSON格式返回，不要包含任何其他文本：

1. **可用工具** (tools): MCP服务器提供的工具/功能，包含参数定义和示例
2. **使用示例** (usage_examples): 完整的使用示例代码
3. **配置选项** (configuration_options): 服务器运行时的配置参数
4. **认证信息** (authentication): 如果需要认证信息

请返回严格的JSON格式，不要包含markdown代码块标记：
{
  "tools": [
    {
      "name": "工具名称",
      "description": "工具描述",
      "parameters": [
        {
          "name": "参数名",
          "type": "string|number|boolean|array|object",
          "required": true|false,
          "description": "参数描述",
          "default": "默认值",
          "enum_values": ["可选值1", "可选值2"]
        }
      ],
      "examples": [
        {
          "title": "示例标题",
          "description": "示例描述",
          "request": {"参数": "值"},
          "response": {"结果": "值"}
        }
      ]
    }
  ],
  "usage_examples": ["完整使用示例代码"],
  "configuration_options": [
    {
      "name": "配置项名称",
      "type": "配置类型",
      "description": "配置说明",
      "default": "默认值",
      "required": true|false
    }
  ],
  "authentication": {
    "type": "api_key|oauth|token|none",
    "description": "认证说明",
    "setup_instructions": ["设置步骤1", "设置步骤2"]
  }
}

README内容:
---
${readmeContent.substring(0, 24000)}
---

请仔细分析并提取所有相关的API信息。如果某些信息不存在，请返回空数组或null。
`;

  try {
    const response = await apiClient.callAPI(prompt);
    
    // 使用强化的JSON解析
    const fallbackAPIReference: ExtractedAPIReference = {
      tools: [],
      usage_examples: [],
      configuration_options: [],
      authentication: null
    };
    
    const extractedData = parseAIResponse<ExtractedAPIReference>(
      response, 
      apiClient['modelType'], 
      fallbackAPIReference
    );
    
    // 验证数据结构
    if (!extractedData.tools) extractedData.tools = [];
    if (!extractedData.usage_examples) extractedData.usage_examples = [];
    if (!extractedData.configuration_options) extractedData.configuration_options = [];

    Logger.success(`API Reference分析完成: ${projectName} (${apiClient['modelType']})`, {
      toolsCount: extractedData.tools.length,
      usageExamplesCount: extractedData.usage_examples.length,
      configurationOptionsCount: extractedData.configuration_options.length,
      hasAuthentication: !!extractedData.authentication
    });

    return extractedData;

  } catch (error) {
    Logger.error(`API Reference分析失败: ${projectName} (${apiClient['modelType']})`, error);
    
    // 返回空的结构而不是抛出错误
    Logger.warning(`返回空的API Reference结构: ${projectName}`);
    return {
      tools: [],
      usage_examples: [],
      configuration_options: [],
      authentication: null
    };
  }
}

/**
 * 保存分析结果到数据库
 */
async function saveToDatabase(
  readmeId: number,
  projectName: string,
  installation: ExtractedInstallation,
  apiReference: ExtractedAPIReference,
  overview: ExtractedOverview
): Promise<void> {
  Logger.info(`保存分析结果到数据库: ${projectName}`, {
    readmeId,
    extractionMode: {
      overview: extractionMode.overview,
      installation: extractionMode.installation,
      api: extractionMode.api
    }
  });

  try {
    // 根据提取模式准备更新数据
    const updateData: Record<string, unknown> = {
      extraction_status: 'completed',
      extracted_at: new Date().toISOString(),
      extraction_error: null
    };

    // 只有在提取了Overview时才保存到extracted_content
    if (extractionMode.overview && overview.introduction.title) {
      updateData.extracted_content = overview;
      Logger.info(`保存Overview数据: ${projectName}`, {
        title: overview.introduction.title,
        keyFeaturesCount: overview.introduction.key_features.length,
        useCasesCount: overview.introduction.use_cases.length
      });
    }

    // 保存Installation和API Reference数据到数据库
    if (extractionMode.installation) {
      updateData.extracted_installation = installation;
      if (installation.methods.length > 0) {
        Logger.info(`保存Installation数据: ${projectName}`, {
          methodsCount: installation.methods.length,
          clientConfigsCount: installation.client_configs.length,
          prerequisitesCount: installation.prerequisites.length,
          environmentSetupCount: installation.environment_setup.length
        });
      } else {
        Logger.info(`保存空的Installation数据: ${projectName}`);
      }
    }

    if (extractionMode.api) {
      updateData.extracted_api_reference = apiReference;
      if (apiReference.tools.length > 0) {
        Logger.info(`保存API Reference数据: ${projectName}`, {
          toolsCount: apiReference.tools.length,
          examplesCount: apiReference.usage_examples.length,
          configOptionsCount: apiReference.configuration_options.length,
          hasAuthentication: !!apiReference.authentication
        });
      } else {
        Logger.info(`保存空的API Reference数据: ${projectName}`);
      }
    }

    const { error } = await supabase
      .from('server_readmes')
      .update(updateData)
      .eq('id', readmeId);

    if (error) {
      throw error;
    }

    Logger.success(`数据库保存成功: ${projectName}`, {
      readmeId,
      extractedAt: new Date().toISOString(),
      savedSections: Object.keys(updateData).filter(key => key.startsWith('extracted'))
    });

  } catch (error) {
    Logger.error(`数据库保存失败: ${projectName}`, error);
    throw new Error(`数据库保存失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 更新处理状态到数据库
 */
async function updateProcessingStatus(readmeId: number, status: 'processing' | 'failed', errorMessage?: string): Promise<void> {
  try {
    const updateData: Record<string, unknown> = {
      extraction_status: status
    };

    if (status === 'failed' && errorMessage) {
      updateData.extraction_error = errorMessage;
    }

    const { error } = await supabase
      .from('server_readmes')
      .update(updateData)
      .eq('id', readmeId);

    if (error) {
      throw error;
    }

    Logger.info(`状态更新成功: ID ${readmeId} -> ${status}`);

  } catch (error) {
    Logger.error(`状态更新失败: ID ${readmeId}`, error);
  }
}

/**
 * 强化JSON清理和解析
 */
function parseAIResponse<T>(response: string, modelType: string, fallbackData: T): T {
  Logger.info(`开始解析${modelType}响应`, {
    originalLength: response.length,
    responsePreview: response.substring(0, 300) + '...'
  });


  // 多层清理策略
  const cleaningStrategies = [
    // 策略1: 激进的markdown清理
    (text: string) => {
      return text
        // 移除所有可能的markdown代码块标记
        .replace(/```[\w]*\s*/g, '')      // 移除 ```json, ```javascript 等
        .replace(/```\s*/g, '')           // 移除单独的 ```
        .replace(/`{3,}/g, '')            // 移除3个或更多的反引号
        .replace(/`+/g, '')               // 移除任何数量的反引号
        .replace(/^\s*Here.*?:\s*/gmi, '')  // 移除 "Here is the JSON:" 等前缀
        .replace(/^\s*Based.*?:\s*/gmi, '') // 移除 "Based on analysis:" 等前缀
        .trim();
    },
    
    // 策略2: 智能JSON提取 - 寻找完整的JSON对象
    (text: string) => {
      // 尝试找到第一个 { 和与之匹配的最后一个 }
      let braceCount = 0;
      let startIndex = -1;
      let endIndex = -1;
      let inString = false;
      
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const prevChar = i > 0 ? text[i - 1] : '';
        
        // 处理字符串状态
        if (char === '"' && prevChar !== '\\') {
          inString = !inString;
        }
        
        if (!inString) {
          if (char === '{') {
            if (startIndex === -1) startIndex = i;
            braceCount++;
          } else if (char === '}') {
            braceCount--;
            if (braceCount === 0 && startIndex !== -1) {
              endIndex = i;
              break; // 找到完整的JSON对象就停止
            }
          }
        }
      }
      
      if (startIndex !== -1 && endIndex !== -1) {
        return text.substring(startIndex, endIndex + 1);
      }
      
      // 后备方案：简单的首尾提取
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return text.substring(firstBrace, lastBrace + 1);
      }
      
      return text;
    },
    
    // 策略3: 修复常见JSON语法错误
    (text: string) => {
      let fixed = text
        .replace(/,\s*([}\]])/g, '$1')     // 移除对象和数组的尾随逗号
        .replace(/([^\\])'([^'\\]*(?:\\.[^'\\]*)*)'/g, '$1"$2"')  // 更安全的单引号转双引号
        .replace(/:\s*'([^'\\]*(?:\\.[^'\\]*)*)'/g, ': "$1"')     // 值的单引号转双引号
        .replace(/}[\s\n]*{/g, '},{')      // 修复对象间缺失的逗号
        .replace(/\[\.\.\.\]/g, '[]')      // 替换 [...] 占位符为空数组
        .replace(/\{\.\.\.}/g, '{}');      // 替换 {...} 占位符为空对象
      
      return fixed;
    },
    
    // 策略4: 修复转义字符问题
    (text: string) => {
      return text
        .replace(/\\n/g, '\n')           // 转换 \\n 为实际换行符
        .replace(/\\r/g, '\r')           // 转换 \\r 为实际回车符
        .replace(/\\t/g, '\t')           // 转换 \\t 为实际制表符
        .replace(/\\\\/g, '\\')          // 转换 \\\\ 为单个反斜杠
        .replace(/\\"/g, '"');           // 转换 \\" 为双引号
    },
    
    // 策略5: 截断处理 - 处理不完整的JSON
    (text: string) => {
      try {
        // 尝试解析，如果失败则逐步截断
        JSON.parse(text);
        return text;
      } catch {
        // 从后往前删除字符，直到找到有效的JSON
        for (let i = text.length - 1; i >= 0; i--) {
          const truncated = text.substring(0, i);
          if (truncated.trim().endsWith('}') || truncated.trim().endsWith(']')) {
            try {
              JSON.parse(truncated);
              return truncated;
            } catch {
              continue;
            }
          }
        }
        return text;
      }
    },
    
    // 策略6: 智能修复 - 尝试补全缺失的结构
    (text: string) => {
      let fixed = text.trim();
      
      // 确保以 { 开始
      if (!fixed.startsWith('{')) {
        const startIndex = fixed.indexOf('{');
        if (startIndex !== -1) {
          fixed = fixed.substring(startIndex);
        }
      }
      
      // 尝试补全缺失的结束括号
      let braceCount = 0;
      let bracketCount = 0;
      let inString = false;
      
      for (let i = 0; i < fixed.length; i++) {
        const char = fixed[i];
        const prevChar = i > 0 ? fixed[i - 1] : '';
        
        if (char === '"' && prevChar !== '\\') {
          inString = !inString;
        }
        
        if (!inString) {
          if (char === '{') braceCount++;
          else if (char === '}') braceCount--;
          else if (char === '[') bracketCount++;
          else if (char === ']') bracketCount--;
        }
      }
      
      // 补全缺失的括号
      while (bracketCount > 0) {
        fixed += ']';
        bracketCount--;
      }
      while (braceCount > 0) {
        fixed += '}';
        braceCount--;
      }
      
      return fixed;
    },
    
    // 策略7: 最终清理
    (text: string) => {
      return text
        .trim()
        .replace(/^\{+/, '{')                    // 移除多余的开始括号
        .replace(/\}+$/, '}')                    // 移除多余的结束括号
        .replace(/,+/g, ',')                     // 合并多个逗号
        .replace(/,\s*([}\]])/g, '$1')           // 移除尾随逗号
        .replace(/([{\[,])\s*,/g, '$1')          // 移除开始位置的逗号
        .replace(/\{\s*,/g, '{')                 // 移除对象开始的逗号
        .replace(/\[\s*,/g, '[')                 // 移除数组开始的逗号
        .replace(/:\s*,/g, ': null,')            // 修复缺失值
        .replace(/,\s*}/g, '}')                  // 再次清理尾随逗号
        .replace(/,\s*]/g, ']');                 // 再次清理尾随逗号
    }
  ];

  // 尝试每个清理策略
  for (let i = 0; i < cleaningStrategies.length; i++) {
    try {
      let cleanedText = response;
      
      // 应用前i+1个策略
      for (let j = 0; j <= i; j++) {
        cleanedText = cleaningStrategies[j](cleanedText);
      }
      
      Logger.info(`尝试清理策略 ${i + 1}`, {
        cleanedLength: cleanedText.length,
        cleanedPreview: cleanedText.substring(0, 200) + '...'
      });
      
      const parsed = JSON.parse(cleanedText);
      Logger.success(`JSON解析成功 (策略 ${i + 1})`);
      return parsed as T;
      
    } catch (parseError) {
      Logger.warning(`清理策略 ${i + 1} 失败`, {
        error: parseError instanceof Error ? parseError.message : String(parseError)
      });
      continue;
    }
  }

  // 所有策略都失败，尝试从错误信息中提取位置信息
  Logger.error('所有JSON解析策略失败，尝试诊断问题');
  
  try {
    JSON.parse(response);
  } catch (finalError) {
    if (finalError instanceof Error) {
      Logger.error('JSON解析详细错误', {
        message: finalError.message,
        responseLength: response.length,
        problemArea: response.substring(Math.max(0, 17000), 18000) // 大概错误位置附近
      });
    }
  }

  Logger.warning(`使用备用数据结构 for ${modelType}`);
  return fallbackData;
}

/**
 * 为异步任务添加超时机制
 */
async function withTimeout<T>(promiseOrFunction: Promise<T> | (() => Promise<T>), timeoutMs: number, taskName: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`任务超时: ${taskName} (${timeoutMs}ms)`));
    }, timeoutMs);

    // 如果是函数，先执行它来获取 Promise
    const promise = typeof promiseOrFunction === 'function' ? promiseOrFunction() : promiseOrFunction;

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeoutId));
  });
}

/**
 * 处理单个README记录（使用AI并立即保存，带超时机制）
 */
async function processReadmeWithAI(readme: ReadmeRecord, currentIndex: number, totalCount: number): Promise<void> {
  const taskStartTime = Date.now();
  const taskTimeoutMs = 300000; // 5分钟任务超时（增加了GitHub获取时间）

  Logger.progress(currentIndex, totalCount, `开始处理: ${readme.project_name}`);
  Logger.info(`处理README详情`, {
    id: readme.id,
    serverId: readme.server_id,
    projectName: readme.project_name,
    filename: readme.filename,
    contentLength: readme.raw_content?.length || 0,
    hasContent: !!readme.raw_content && readme.raw_content.trim().length > 0,
    currentStatus: readme.extraction_status,
    taskTimeout: `${taskTimeoutMs / 1000}秒`
  });
  
  try {
    await withTimeout(async () => {
      // 步骤0: 检查是否需要从GitHub获取README内容
      let readmeContent = readme.raw_content;
      
      if (!readmeContent || readmeContent.trim().length === 0) {
        Logger.info(`步骤0: README内容为空，尝试从GitHub获取 - ${readme.project_name}`);
        
        try {
          // 获取服务器的GitHub URL
          const githubUrl = await fetchServerGithubUrl(readme.server_id);
          
          // 从GitHub获取README内容
          const fetchedContent = await GitHubReadmeFetcher.fetchReadmeContent(githubUrl);
          
          // 保存获取的内容到数据库
          await saveReadmeContent(readme.id, fetchedContent, 'README.md');
          
          // 更新本地变量以便后续处理
          readmeContent = fetchedContent;
          
          Logger.success(`步骤0完成: 从GitHub获取README成功 - ${readme.project_name}`, {
            githubUrl,
            contentLength: fetchedContent.length
          });
          
        } catch (githubError) {
          Logger.error(`步骤0失败: 无法从GitHub获取README - ${readme.project_name}`, githubError);
          
          // 如果无法从GitHub获取，标记为失败并跳过
          const errorMessage = `无法从GitHub获取README: ${githubError instanceof Error ? githubError.message : String(githubError)}`;
          await updateProcessingStatus(readme.id, 'failed', errorMessage);
          return; // 退出处理
        }
      }

      // 步骤1: 更新状态为处理中
      Logger.info(`步骤1: 更新处理状态 - ${readme.project_name}`);
      await updateProcessingStatus(readme.id, 'processing');

      // 步骤2: 使用AI并行分析（DeepSeek或Gemini）
      Logger.info(`步骤2: 启动AI分析 - ${readme.project_name}`);
      const analysisStartTime = Date.now();
      
      // 根据命令行参数决定提取哪些内容
      let extractedOverview: ExtractedOverview = {
        introduction: {
          title: '',
          summary: '',
          motivation: '',
          core_functionality: '',
          key_features: [],
          use_cases: [],
          unique_value: ''
        }
      };
      
      let extractedInstallation: ExtractedInstallation = {
        methods: [],
        client_configs: [],
        prerequisites: [],
        environment_setup: []
      };
      
      let extractedApiReference: ExtractedAPIReference = {
        tools: [],
        usage_examples: [],
        configuration_options: []
      };

      // 并行执行需要的分析任务
      const analysisTasks: Promise<void>[] = [];
      
      if (extractionMode.overview) {
        analysisTasks.push(
          analyzeOverviewWithAI(readmeContent, readme.project_name)
            .then(result => { extractedOverview = result; })
        );
      }
      
      if (extractionMode.installation) {
        analysisTasks.push(
          analyzeInstallationWithAI(readmeContent, readme.project_name)
            .then(result => { extractedInstallation = result; })
        );
      }
      
      if (extractionMode.api) {
        analysisTasks.push(
          analyzeAPIReferenceWithAI(readmeContent, readme.project_name)
            .then(result => { extractedApiReference = result; })
        );
      }
      
      // 等待所有分析任务完成
      await Promise.all(analysisTasks);

      const analysisEndTime = Date.now();
      const analysisDuration = analysisEndTime - analysisStartTime;
      
      const extractionSummary = {
        duration: `${analysisDuration}ms`,
        extractedSections: []
      };
      
      if (extractionMode.overview && extractedOverview.introduction.title) {
        extractionSummary.extractedSections.push('Overview');
        extractionSummary['overviewTitle'] = extractedOverview.introduction.title;
        extractionSummary['keyFeaturesCount'] = extractedOverview.introduction.key_features.length;
        extractionSummary['useCasesCount'] = extractedOverview.introduction.use_cases.length;
      }
      
      if (extractionMode.installation && extractedInstallation.methods.length > 0) {
        extractionSummary.extractedSections.push('Installation');
        extractionSummary['installationMethodsCount'] = extractedInstallation.methods.length;
      }
      
      if (extractionMode.api && extractedApiReference.tools.length > 0) {
        extractionSummary.extractedSections.push('API Reference');
        extractionSummary['apiToolsCount'] = extractedApiReference.tools.length;
      }
      
      Logger.success(`步骤2完成: AI分析完成 - ${readme.project_name}`, extractionSummary);

      // 步骤3: 立即保存到数据库
      Logger.info(`步骤3: 保存分析结果到数据库 - ${readme.project_name}`);
      const saveStartTime = Date.now();
      
      await saveToDatabase(readme.id, readme.project_name, extractedInstallation, extractedApiReference, extractedOverview);
      
      const saveEndTime = Date.now();
      const saveDuration = saveEndTime - saveStartTime;

      Logger.success(`步骤3完成: 数据库保存完成 - ${readme.project_name}`, {
        duration: `${saveDuration}ms`,
        totalDuration: `${analysisEndTime - analysisStartTime + saveDuration}ms`
      });
    }, taskTimeoutMs, `处理README: ${readme.project_name}`);

    const taskEndTime = Date.now();
    const taskDuration = taskEndTime - taskStartTime;
    
    Logger.progress(currentIndex, totalCount, `✅ 完成: ${readme.project_name} (${taskDuration}ms)`);
    
  } catch (error) {
    const taskEndTime = Date.now();
    const taskDuration = taskEndTime - taskStartTime;
    
    Logger.error(`处理失败: ${readme.project_name} (${taskDuration}ms)`, error);
    
    // 更新错误状态到数据库
    const errorMessage = error instanceof Error ? error.message : String(error);
    await updateProcessingStatus(readme.id, 'failed', errorMessage);
    
    Logger.progress(currentIndex, totalCount, `❌ 失败: ${readme.project_name} (${taskDuration}ms)`);
    throw error; // 重新抛出错误以便上层处理
  }
}

/**
 * 分页查询README记录（包括需要从GitHub获取的记录）
 */
async function fetchReadmesByPage(page: number, pageSize: number = 100): Promise<ReadmeRecord[]> {
  Logger.info(`查询第 ${page} 页README记录`, {
    page,
    pageSize,
    offset: (page - 1) * pageSize
  });

  const { data: readmes, error } = await supabase
    .from('server_readmes')
    .select('id, server_id, filename, project_name, raw_content, extraction_status')
    .or('extraction_status.in.(pending,failed),raw_content.is.null,raw_content.eq.')
    .order('id')
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    Logger.error(`第 ${page} 页查询失败`, error);
    throw error;
  }

  Logger.success(`第 ${page} 页查询成功`, {
    page,
    found: readmes?.length || 0,
    pageSize
  });

  return readmes || [];
}

/**
 * 获取服务器的GitHub URL
 */
async function fetchServerGithubUrl(serverId: string): Promise<string> {
  Logger.info(`获取服务器GitHub URL: ${serverId}`);

  const { data: server, error } = await supabase
    .from('mcp_servers')
    .select('id, github_url, name')
    .eq('id', serverId)
    .single();

  if (error) {
    Logger.error(`获取服务器信息失败: ${serverId}`, error);
    throw error;
  }

  if (!server || !server.github_url) {
    throw new Error(`服务器 ${serverId} 没有GitHub URL`);
  }

  Logger.success(`获取GitHub URL成功: ${serverId}`, {
    serverId,
    githubUrl: server.github_url,
    serverName: server.name
  });

  return server.github_url;
}

/**
 * 保存从GitHub获取的README内容到数据库
 */
async function saveReadmeContent(readmeId: number, content: string, filename: string): Promise<void> {
  Logger.info(`保存README内容到数据库: ID ${readmeId}`);

  try {
    const { error } = await supabase
      .from('server_readmes')
      .update({
        raw_content: content,
        filename: filename,
        extraction_status: 'pending' // 重置为pending，以便后续提取
      })
      .eq('id', readmeId);

    if (error) {
      throw error;
    }

    Logger.success(`README内容保存成功: ID ${readmeId}`, {
      readmeId,
      contentLength: content.length,
      filename
    });

  } catch (error) {
    Logger.error(`README内容保存失败: ID ${readmeId}`, error);
    throw new Error(`保存失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 获取待处理README总数（包括需要从GitHub获取的记录）
 */
async function getTotalReadmeCount(): Promise<number> {
  Logger.info('获取待处理README总数...');

  const { count, error } = await supabase
    .from('server_readmes')
    .select('*', { count: 'exact', head: true })
    .or('extraction_status.in.(pending,failed),raw_content.is.null,raw_content.eq.');

  if (error) {
    Logger.error('获取总数失败', error);
    throw error;
  }

  Logger.success('获取总数成功', { totalCount: count || 0 });
  return count || 0;
}

/**
 * 线程池管理类
 */
class ThreadPool {
  private activeThreads: number = 0;
  private maxThreads: number;
  private taskQueue: ReadmeRecord[] = [];
  private processedCount: number = 0;
  private successCount: number = 0;
  private failureCount: number = 0;
  private totalTasks: number = 0;
  private startTime: number;

  constructor(maxThreads: number = 10) {
    this.maxThreads = maxThreads;
    this.startTime = Date.now();
    
    Logger.info('线程池初始化', {
      maxThreads: this.maxThreads,
      initialQueueSize: 0
    });
  }

  /**
   * 添加任务到队列
   */
  async addTask(readme: ReadmeRecord): Promise<void> {
    this.taskQueue.push(readme);
    this.totalTasks++;
    
    Logger.info(`任务添加到队列: ${readme.project_name}`, {
      queueSize: this.taskQueue.length,
      activeThreads: this.activeThreads,
      totalTasks: this.totalTasks
    });

    // 尝试启动新线程处理任务
    this.tryStartThread();
  }

  /**
   * 批量添加任务
   */
  async addTasks(readmes: ReadmeRecord[]): Promise<void> {
    this.taskQueue.push(...readmes);
    this.totalTasks += readmes.length;
    
    Logger.info(`批量添加 ${readmes.length} 个任务到队列`, {
      queueSize: this.taskQueue.length,
      activeThreads: this.activeThreads,
      totalTasks: this.totalTasks
    });

    // 尝试启动多个线程
    for (let i = 0; i < Math.min(readmes.length, this.maxThreads - this.activeThreads); i++) {
      this.tryStartThread();
    }
  }

  /**
   * 尝试启动新线程
   */
  private tryStartThread(): void {
    if (this.activeThreads >= this.maxThreads || this.taskQueue.length === 0) {
      return;
    }

    this.activeThreads++;
    const threadId = this.activeThreads;
    
    Logger.info(`启动线程 ${threadId}`, {
      activeThreads: this.activeThreads,
      queueSize: this.taskQueue.length
    });

    // 异步启动线程
    this.runThread(threadId).catch(error => {
      Logger.error(`线程 ${threadId} 异常退出`, error);
    });
  }

  /**
   * 线程运行逻辑
   */
  private async runThread(threadId: number): Promise<void> {
    Logger.info(`线程 ${threadId} 开始运行`);

    while (this.taskQueue.length > 0) {
      const readme = this.taskQueue.shift();
      if (!readme) break;

      try {
        Logger.info(`线程 ${threadId} 开始处理: ${readme.project_name}`, {
          threadId,
          remainingTasks: this.taskQueue.length,
          progress: `${this.processedCount + 1}/${this.totalTasks}`
        });

        await processReadmeWithAI(readme, this.processedCount + 1, this.totalTasks);
        
        this.successCount++;
        this.processedCount++;
        
        Logger.success(`线程 ${threadId} 处理成功: ${readme.project_name}`, {
          threadId,
          successCount: this.successCount,
          totalProcessed: this.processedCount
        });

      } catch (error) {
        this.failureCount++;
        this.processedCount++;
        
        Logger.error(`线程 ${threadId} 处理失败: ${readme.project_name}`, error);
      }

      // 显示总体进度
      const progressPercent = Math.round((this.processedCount / this.totalTasks) * 100);
      Logger.progress(this.processedCount, this.totalTasks, 
        `线程${threadId} | 成功:${this.successCount} 失败:${this.failureCount} | ${progressPercent}%`);
    }

    this.activeThreads--;
    Logger.info(`线程 ${threadId} 运行结束`, {
      activeThreads: this.activeThreads,
      processedCount: this.processedCount,
      successCount: this.successCount,
      failureCount: this.failureCount
    });
  }

  /**
   * 等待所有任务完成，带卡死检测
   */
  async waitForCompletion(): Promise<{
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    duration: number;
  }> {
    Logger.info('等待所有线程完成任务...');

    let lastProcessedCount = this.processedCount;
    let noProgressCount = 0;
    const maxNoProgressIterations = 30; // 30秒无进展视为卡死

    // 轮询直到所有任务完成
    while (this.activeThreads > 0 || this.taskQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 检测进度停滞
      if (this.processedCount === lastProcessedCount) {
        noProgressCount++;
        if (noProgressCount >= maxNoProgressIterations) {
          Logger.error('检测到线程池可能卡死', {
            noProgressSeconds: noProgressCount,
            activeThreads: this.activeThreads,
            queueSize: this.taskQueue.length,
            processedCount: this.processedCount,
            totalTasks: this.totalTasks
          });
          
          // 强制终止，避免无限等待
          Logger.warning('强制终止等待，部分任务可能未完成');
          break;
        }
      } else {
        noProgressCount = 0; // 重置计数器
        lastProcessedCount = this.processedCount;
      }
      
      // 记录详细状态（每5秒一次）
      if (noProgressCount % 5 === 0) {
        Logger.info('线程池状态检查', {
          activeThreads: this.activeThreads,
          queueSize: this.taskQueue.length,
          processedCount: this.processedCount,
          totalTasks: this.totalTasks,
          noProgressSeconds: noProgressCount,
          progressRate: `${Math.round((this.processedCount / this.totalTasks) * 100)}%`
        });
      }
    }

    const endTime = Date.now();
    const duration = endTime - this.startTime;

    const result = {
      totalProcessed: this.processedCount,
      successCount: this.successCount,
      failureCount: this.failureCount,
      duration
    };

    Logger.success('所有线程任务完成', {
      ...result,
      successRate: `${Math.round((this.successCount / this.processedCount) * 100)}%`,
      durationSeconds: `${Math.round(duration / 1000)}秒`,
      averageTimePerTask: `${Math.round(duration / this.processedCount)}ms`
    });

    return result;
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      activeThreads: this.activeThreads,
      queueSize: this.taskQueue.length,
      processedCount: this.processedCount,
      successCount: this.successCount,
      failureCount: this.failureCount,
      totalTasks: this.totalTasks
    };
  }
}

/**
 * 主函数 - 使用分页查询和线程池处理
 */
async function main(): Promise<void> {
  const startTime = Date.now();
  
  Logger.info('=' .repeat(80));
  Logger.info('🚀 AI README智能解析任务开始 (分页+线程池模式)');
  Logger.info('=' .repeat(80));
  
  // 显示提取模式
  const extractionModes = [];
  if (extractionMode.overview) extractionModes.push('Overview');
  if (extractionMode.installation) extractionModes.push('Installation');
  if (extractionMode.api) extractionModes.push('API Reference');
  
  Logger.info('提取模式配置', {
    modes: extractionModes.join(', '),
    overview: extractionMode.overview,
    installation: extractionMode.installation,
    api: extractionMode.api,
    all: extractionMode.all
  });
  
  Logger.info('环境配置检查', {
    hasDeepSeek: hasDeepSeek,
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseServiceKey,
    deepseekApiUrl: hasDeepSeek ? DEEPSEEK_API_URL : 'N/A',
    hasGitHubToken: hasGitHubToken,
    githubRateLimit: hasGitHubToken ? '5000/hour (authenticated)' : '60/hour (unauthenticated)',
    githubFetching: 'enabled'
  });

  try {
    // 步骤1: 获取待处理README总数
    Logger.info('步骤1: 获取待处理README总数...');
    const totalCount = await getTotalReadmeCount();
    
    if (totalCount === 0) {
      Logger.warning('没有找到需要处理的README文件');
      Logger.info('处理条件: extraction_status in ("pending", "failed") OR raw_content is NULL/empty');
      return;
    }

    const pageSize = 100;
    const totalPages = Math.ceil(totalCount / pageSize);
    const maxThreads = 10;

    Logger.info('任务概览', {
      totalReadmes: totalCount,
      pageSize: pageSize,
      totalPages: totalPages,
      maxThreads: maxThreads,
      estimatedDuration: `${Math.round(totalCount * 30 / maxThreads / 60)}分钟` // 预估每个README 30秒
    });

    // 步骤2: 创建线程池 (明确指定10个线程)
    Logger.info('步骤2: 初始化线程池...');
    const threadPool = new ThreadPool(10);

    // 步骤3: 分页加载并添加到线程池
    Logger.info('步骤3: 开始分页加载任务...');
    let totalLoadedTasks = 0;

    for (let page = 1; page <= totalPages; page++) {
      Logger.info(`加载第 ${page}/${totalPages} 页任务`, {
        page,
        totalPages,
        loadedTasks: totalLoadedTasks,
        threadPoolStatus: threadPool.getStatus()
      });

      try {
        const readmes = await fetchReadmesByPage(page, pageSize);
        
        if (readmes.length === 0) {
          Logger.warning(`第 ${page} 页没有数据，跳过`);
          continue;
        }

        // 批量添加任务到线程池
        await threadPool.addTasks(readmes);
        totalLoadedTasks += readmes.length;

        Logger.success(`第 ${page} 页任务加载完成`, {
          pageLoaded: readmes.length,
          totalLoaded: totalLoadedTasks,
          remaining: totalCount - totalLoadedTasks,
          threadPoolStatus: threadPool.getStatus()
        });

        // 如果线程池队列过大，等待一些任务完成
        const currentStatus = threadPool.getStatus();
        if (currentStatus.queueSize > 50) {
          Logger.info('队列任务较多，等待部分任务完成...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }

      } catch (error) {
        Logger.error(`第 ${page} 页加载失败`, error);
        // 继续处理下一页
      }
    }

    Logger.success('所有任务已加载到线程池', {
      totalLoaded: totalLoadedTasks,
      expectedTotal: totalCount,
      finalThreadPoolStatus: threadPool.getStatus()
    });

    // 步骤4: 等待所有任务完成
    Logger.info('步骤4: 等待所有线程完成处理...');
    const result = await threadPool.waitForCompletion();

    const endTime = Date.now();
    const totalDuration = endTime - startTime;

    Logger.info('=' .repeat(80));
    Logger.success('🎉 AI README智能解析任务完成', {
      ...result,
      totalDuration: `${Math.round(totalDuration / 1000)}秒`,
      averageTimePerReadme: `${Math.round(result.duration / result.totalProcessed)}ms`,
      throughput: `${Math.round(result.totalProcessed / (totalDuration / 1000 / 60))} README/分钟`,
      successRate: `${Math.round((result.successCount / result.totalProcessed) * 100)}%`
    });
    
    // 显示API使用统计
    Logger.info('📊 API使用统计', {
      deepseek: apiUsageStats.deepseek,
      gemini: apiUsageStats.gemini,
      deepseekSuccessRate: apiUsageStats.deepseek.attempts > 0 
        ? `${Math.round((apiUsageStats.deepseek.successes / apiUsageStats.deepseek.attempts) * 100)}%` 
        : 'N/A',
      geminiSuccessRate: apiUsageStats.gemini.attempts > 0 
        ? `${Math.round((apiUsageStats.gemini.successes / apiUsageStats.gemini.attempts) * 100)}%` 
        : 'N/A'
    });
    
    Logger.info('=' .repeat(80));

  } catch (error) {
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    Logger.error('💥 处理过程中出现严重错误', error);
    Logger.info(`处理总耗时: ${Math.round(totalDuration / 1000)}秒`);
    process.exit(1);
  }
}

// 运行主函数
main().catch((error) => {
  Logger.error('主函数执行失败', error);
  process.exit(1);
});

export { main };