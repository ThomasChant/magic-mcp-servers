#!/usr/bin/env tsx

/**
 * AI README智能解析脚本
 * 使用DeepSeek或Gemini API进行README内容的智能分析和结构化提取
 * 每完成一个分析就立即保存到数据库，并提供详细的日志记录
 * 
 * 运行方式: npm run claude:parse-readmes-ai
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

// Supabase配置
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// 检查API配置
const hasDeepSeek = !!DEEPSEEK_API_KEY;


if (!hasDeepSeek) {
  console.error('❌ 缺少AI API配置: 至少需要配置DEEPSEEK_API_KEY');
  console.log('请在.env.local文件中添加:');
  console.log('  DEEPSEEK_API_KEY=your_deepseek_api_key');
  process.exit(1);
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
${readmeContent.substring(0, 12000)}
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
${readmeContent.substring(0, 12000)}
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
    overview: {
      title: overview.introduction.title,
      keyFeaturesCount: overview.introduction.key_features.length,
      useCasesCount: overview.introduction.use_cases.length
    }
  });

  try {
    const { error } = await supabase
      .from('server_readmes')
      .update({
        extracted_content: overview,
        extraction_status: 'completed',
        extracted_at: new Date().toISOString(),
        extraction_error: null
      })
      .eq('id', readmeId);

    if (error) {
      throw error;
    }

    Logger.success(`数据库保存成功: ${projectName}`, {
      readmeId,
      extractedAt: new Date().toISOString()
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
    // 策略1: 基础清理
    (text: string) => text
      .replace(/```json\s*\n?/g, '')
      .replace(/```\s*\n?/g, '')
      .trim(),
    
    // 策略2: 提取JSON块
    (text: string) => {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? jsonMatch[0] : text;
    },
    
    // 策略3: 修复常见JSON错误
    (text: string) => text
      .replace(/,\s*}/g, '}')  // 移除尾随逗号
      .replace(/,\s*]/g, ']')  // 移除数组尾随逗号
      .replace(/([^\\])"/g, '$1"')  // 确保引号正确转义
      .replace(/\n/g, '\\n')  // 转义换行符
      .replace(/\r/g, '\\r')  // 转义回车符
      .replace(/\t/g, '\\t'),  // 转义制表符
    
    // 策略4: 截断到最后一个完整的JSON对象
    (text: string) => {
      let braceCount = 0;
      let lastValidIndex = -1;
      
      for (let i = 0; i < text.length; i++) {
        if (text[i] === '{') braceCount++;
        if (text[i] === '}') {
          braceCount--;
          if (braceCount === 0) lastValidIndex = i;
        }
      }
      
      return lastValidIndex > 0 ? text.substring(0, lastValidIndex + 1) : text;
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
  const taskTimeoutMs = 180000; // 3分钟任务超时

  Logger.progress(currentIndex, totalCount, `开始处理: ${readme.project_name}`);
  Logger.info(`处理README详情`, {
    id: readme.id,
    serverId: readme.server_id,
    projectName: readme.project_name,
    filename: readme.filename,
    contentLength: readme.raw_content.length,
    currentStatus: readme.extraction_status,
    taskTimeout: `${taskTimeoutMs / 1000}秒`
  });
  
  try {
    await withTimeout(async () => {
      // 步骤1: 更新状态为处理中
      Logger.info(`步骤1: 更新处理状态 - ${readme.project_name}`);
      await updateProcessingStatus(readme.id, 'processing');

      // 步骤2: 使用AI并行分析（DeepSeek或Gemini）
      Logger.info(`步骤2: 启动AI分析 - ${readme.project_name}`);
      const analysisStartTime = Date.now();
      
      // 只提取Overview信息，注释掉Installation和API Reference的提取
      const extractedOverview = await analyzeOverviewWithAI(readme.raw_content, readme.project_name);
      
      // 创建空的Installation和API Reference对象
      const extractedInstallation: ExtractedInstallation = {
        methods: [],
        client_configs: [],
        prerequisites: [],
        environment_setup: []
      };
      
      const extractedApiReference: ExtractedAPIReference = {
        tools: [],
        usage_examples: [],
        configuration_options: []
      };

      const analysisEndTime = Date.now();
      const analysisDuration = analysisEndTime - analysisStartTime;
      
      Logger.success(`步骤2完成: AI分析完成 - ${readme.project_name}`, {
        duration: `${analysisDuration}ms`,
        overviewTitle: extractedOverview.introduction.title,
        keyFeaturesCount: extractedOverview.introduction.key_features.length,
        useCasesCount: extractedOverview.introduction.use_cases.length
      });

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
 * 分页查询README记录
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
    .in('extraction_status', ['pending', 'failed'])
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
 * 获取待处理README总数
 */
async function getTotalReadmeCount(): Promise<number> {
  Logger.info('获取待处理README总数...');

  const { count, error } = await supabase
    .from('server_readmes')
    .select('*', { count: 'exact', head: true })
    .in('extraction_status', ['pending', 'failed']);

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
  
  Logger.info('环境配置检查', {
    hasDeepSeek: hasDeepSeek,
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseServiceKey,
    deepseekApiUrl: hasDeepSeek ? DEEPSEEK_API_URL : 'N/A'
  });

  try {
    // 步骤1: 获取待处理README总数
    Logger.info('步骤1: 获取待处理README总数...');
    const totalCount = await getTotalReadmeCount();
    
    if (totalCount === 0) {
      Logger.warning('没有找到需要处理的README文件');
      Logger.info('处理条件: extraction_status in ("pending", "failed")');
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