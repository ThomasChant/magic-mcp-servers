import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// 加载环境变量
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('请确保 .env.local 文件中包含 VITE_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

// 接口定义
interface ServerData {
  id: string;
  name: string;
  description_en: string | null;
  description_zh_cn: string | null;
  full_description: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  readme_content: string | null;
  categorization_keywords: string[] | null;
}

interface TagData {
  id: number;
  name: string;
}

interface CategoryData {
  id: string;
  name_en: string;
  name_zh_cn: string;
}

interface TagMatch {
  tagId: number;
  tagName: string;
  score: number;
  reason: string;
}

interface TagMatchResult {
  serverId: string;
  tagIds: number[];
  matchReasons: string[];
  matches: TagMatch[];
}

/**
 * 从Supabase读取所有服务器数据（支持分页，避免1000条限制）
 */
async function fetchServers(): Promise<ServerData[]> {
  const pageSize = 1000; // Supabase默认最大限制
  let allServers: ServerData[] = [];
  let page = 0;
  let hasMore = true;

  console.log('开始分页获取服务器数据...');

  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('mcp_servers')
      .select(`
        id,
        name,
        description_en,
        description_zh_cn,
        full_description,
        category_id,
        subcategory_id,
        readme_content,
        categorization_keywords
      `, { count: 'exact' })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch servers (page ${page + 1}): ${error.message}`);
    }

    if (data && data.length > 0) {
      allServers = [...allServers, ...data];
      console.log(`获取第 ${page + 1} 页，本页 ${data.length} 条，累计 ${allServers.length} 条`);
    }

    // 检查是否还有更多数据
    hasMore = data && data.length === pageSize && (!count || allServers.length < count);
    page++;
  }

  console.log(`总共获取到 ${allServers.length} 个服务器`);
  return allServers;
}

/**
 * 从Supabase读取所有标签数据
 */
async function fetchTags(): Promise<TagData[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('id, name');

  if (error) {
    throw new Error(`Failed to fetch tags: ${error.message}`);
  }

  return data || [];
}

/**
 * 从Supabase读取分类数据
 */
async function fetchCategories(): Promise<CategoryData[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name_en, name_zh_cn');

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return data || [];
}

/**
 * 从Supabase读取子分类数据
 */
async function fetchSubcategories(): Promise<CategoryData[]> {
  const { data, error } = await supabase
    .from('subcategories')
    .select('id, name_en, name_zh_cn');

  if (error) {
    throw new Error(`Failed to fetch subcategories: ${error.message}`);
  }

  return data || [];
}

/**
 * 获取服务器现有的标签
 */
async function getExistingServerTags(serverId: string): Promise<number[]> {
  const { data, error } = await supabase
    .from('server_tags')
    .select('tag_id')
    .eq('server_id', serverId);

  if (error) {
    console.warn(`Failed to fetch existing tags for server ${serverId}: ${error.message}`);
    return [];
  }

  return data?.map(item => item.tag_id) || [];
}

/**
 * 增强的标签匹配算法
 * 基于服务器描述、分类和关键词为服务器匹配合适的标签，并计算相关度分数
 * 最多返回5个相关度最高的标签
 */
function matchTagsForServer(
  server: ServerData,
  tags: TagData[],
  categories: Map<string, CategoryData>,
  subcategories: Map<string, CategoryData>
): { tagIds: number[]; reasons: string[]; matches: TagMatch[] } {
  const matchCandidates: TagMatch[] = [];

  // 构建搜索文本，包含所有可搜索的内容
  const searchTexts: string[] = [];
  
  if (server.description_en) searchTexts.push(server.description_en.toLowerCase());
  if (server.description_zh_cn) searchTexts.push(server.description_zh_cn.toLowerCase());
  if (server.full_description) searchTexts.push(server.full_description.toLowerCase());
  if (server.name) searchTexts.push(server.name.toLowerCase());
  
  // 添加分类信息到搜索文本
  if (server.category_id) {
    const category = categories.get(server.category_id);
    if (category) {
      searchTexts.push(category.name_en.toLowerCase());
      searchTexts.push(category.name_zh_cn.toLowerCase());
    }
  }
  
  if (server.subcategory_id) {
    const subcategory = subcategories.get(server.subcategory_id);
    if (subcategory) {
      searchTexts.push(subcategory.name_en.toLowerCase());
      searchTexts.push(subcategory.name_zh_cn.toLowerCase());
    }
  }

  // 添加关键词到搜索文本
  if (server.categorization_keywords) {
    server.categorization_keywords.forEach(keyword => {
      searchTexts.push(keyword.toLowerCase());
    });
  }

  // 如果有README内容，取前2000字符进行匹配
  if (server.readme_content) {
    searchTexts.push(server.readme_content.toLowerCase().substring(0, 2000));
  }

  const fullSearchText = searchTexts.join(' ');

  // 特殊的技术栈和框架匹配
  const techKeywords = {
    'javascript': ['js', 'node', 'npm', 'yarn'],
    'python': ['py', 'pip', 'pypi'],
    'typescript': ['ts', 'tsc'],
    'react': ['jsx', 'tsx'],
    'docker': ['dockerfile', 'container'],
    'api': ['rest', 'graphql', 'endpoint'],
    'database': ['sql', 'postgres', 'mysql', 'mongo'],
    'ai': ['llm', 'gpt', 'claude', 'openai', 'machine learning', 'ml'],
    'web': ['http', 'https', 'browser', 'frontend'],
    'backend': ['server', 'service'],
    'data': ['json', 'csv', 'xml', 'yaml'],
    'security': ['auth', 'jwt', 'oauth', 'encryption'],
    'testing': ['test', 'spec', 'mock', 'jest'],
    'development': ['dev', 'debug', 'build'],
    'utility': ['util', 'helper', 'tool'],
    'integration': ['connector', 'plugin', 'extension']
  };

  // 遍历所有标签，计算相关度分数
  tags.forEach(tag => {
    const tagName = tag.name.toLowerCase();
    const tagWords = tagName.split(/[-_\s]+/); // 支持连字符、下划线和空格分割
    
    let score = 0;
    let matchReason = '';

    // 1. 精确匹配标签名 (最高分)
    if (fullSearchText.includes(tagName)) {
      score = 100;
      matchReason = `精确匹配标签名 "${tag.name}"`;
    }
    
    // 2. 匹配标签中的各个单词
    else if (tagWords.length > 1) {
      const wordMatches = tagWords.filter(word => 
        word.length > 2 && fullSearchText.includes(word)
      );
      const matchRatio = wordMatches.length / tagWords.length;
      if (matchRatio >= 0.6) {
        score = Math.round(80 * matchRatio);
        matchReason = `匹配标签关键词 "${wordMatches.join(', ')}" 来自 "${tag.name}"`;
      }
    }

    // 3. 特殊的技术栈和框架匹配
    if (score === 0 && techKeywords[tagName]) {
      const relatedKeywords = techKeywords[tagName];
      const foundKeywords = relatedKeywords.filter(keyword => 
        fullSearchText.includes(keyword)
      );
      if (foundKeywords.length > 0) {
        const keywordRatio = foundKeywords.length / relatedKeywords.length;
        score = Math.round(60 * keywordRatio);
        matchReason = `通过相关技术关键词 "${foundKeywords.join(', ')}" 匹配到 "${tag.name}"`;
      }
    }

    // 4. 部分匹配 (较低分数)
    if (score === 0) {
      // 检查标签名是否作为子字符串出现
      if (tagName.length > 3 && fullSearchText.includes(tagName)) {
        score = 40;
        matchReason = `部分匹配标签名 "${tag.name}"`;
      }
      // 检查是否有单个重要单词匹配
      else if (tagWords.length === 1 && tagName.length > 3 && fullSearchText.includes(tagName)) {
        score = 30;
        matchReason = `单词匹配 "${tag.name}"`;
      }
    }

    // 只保留有一定相关度的标签
    if (score >= 30) {
      matchCandidates.push({
        tagId: tag.id,
        tagName: tag.name,
        score,
        reason: matchReason
      });
    }
  });

  // 按分数排序，取前5个
  const topMatches = matchCandidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const tagIds = topMatches.map(match => match.tagId);
  const reasons = topMatches.map(match => `${server.name}: ${match.reason} (分数: ${match.score})`);

  return {
    tagIds,
    reasons,
    matches: topMatches
  };
}

/**
 * 清除服务器现有标签并保存新标签到Supabase
 * 这个函数会先删除所有现有标签，然后插入新的标签
 */
async function saveServerTags(
  serverId: string, 
  tagIds: number[], 
  _existingTagIds: number[] // 保留参数兼容性，但不再使用
): Promise<void> {
  if (tagIds.length === 0) {
    console.log(`服务器 ${serverId} 没有匹配到标签，跳过`);
    return;
  }

  // 第一步：删除服务器的所有现有标签
  const { error: deleteError } = await supabase
    .from('server_tags')
    .delete()
    .eq('server_id', serverId);

  if (deleteError) {
    throw new Error(`Failed to clear existing tags for server ${serverId}: ${deleteError.message}`);
  }

  // 第二步：插入新的标签（限制最多5个）
  const limitedTagIds = tagIds.slice(0, 5);
  const insertData = limitedTagIds.map(tagId => ({
    server_id: serverId,
    tag_id: tagId
  }));

  const { error: insertError } = await supabase
    .from('server_tags')
    .insert(insertData);

  if (insertError) {
    throw new Error(`Failed to save new tags for server ${serverId}: ${insertError.message}`);
  }

  console.log(`✅ 服务器 ${serverId} 已更新标签: ${limitedTagIds.length} 个`);
}

/**
 * 主函数：为服务器添加标签
 * @param options 配置选项
 * @returns 处理结果
 */
export async function addTagForServers(options: {
  serverId?: string; // 可选：只处理特定服务器
  dryRun?: boolean;  // 可选：只返回匹配结果，不保存到数据库
  batchSize?: number; // 可选：批处理大小，默认50
} = {}): Promise<{
  success: boolean;
  count: number;
  errors: string[];
  matchResults?: TagMatchResult[];
}> {
  const { serverId, dryRun = false, batchSize = 50 } = options;
  const errors: string[] = [];
  const matchResults: TagMatchResult[] = [];
  let processedCount = 0;

  try {
    console.log('开始获取数据...');
    
    // 并行获取所有需要的数据
    const [servers, tags, categories, subcategories] = await Promise.all([
      fetchServers(),
      fetchTags(),
      fetchCategories(),
      fetchSubcategories()
    ]);

    console.log(`获取到 ${servers.length} 个服务器, ${tags.length} 个标签, ${categories.length} 个分类`);

    // 创建分类映射
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
    const subcategoryMap = new Map(subcategories.map(subcat => [subcat.id, subcat]));

    // 过滤服务器（如果指定了特定服务器ID）
    const serversToProcess = serverId 
      ? servers.filter(server => server.id === serverId)
      : servers;

    if (serversToProcess.length === 0) {
      return {
        success: false,
        count: 0,
        errors: serverId ? [`Server with ID ${serverId} not found`] : ['No servers to process'],
        matchResults
      };
    }

    console.log(`开始处理 ${serversToProcess.length} 个服务器...`);

    // 批处理服务器
    for (let i = 0; i < serversToProcess.length; i += batchSize) {
      const batch = serversToProcess.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (server) => {
        try {
          // 匹配标签
          const { tagIds, reasons, matches } = matchTagsForServer(
            server, 
            tags, 
            categoryMap, 
            subcategoryMap
          );

          if (tagIds.length > 0) {
            matchResults.push({
              serverId: server.id,
              tagIds,
              matchReasons: reasons,
              matches
            });

            // 如果不是干运行模式，保存到数据库
            if (!dryRun) {
              const existingTagIds = await getExistingServerTags(server.id);
              await saveServerTags(server.id, tagIds, existingTagIds);
              console.log(`🏷️  ${server.name}: 已更新为前${tagIds.length}个最相关标签 (${matches.map(m => `${m.tagName}:${m.score}`).join(', ')})`);
            } else {
              console.log(`[DRY RUN] ${server.name} 将获得 ${tagIds.length} 个标签:`);
              matches.forEach(match => {
                console.log(`  - ${match.tagName} (分数: ${match.score}) - ${match.reason}`);
              });
            }
          } else {
            console.log(`⚠️  ${server.name}: 未找到匹配的标签`);
          }

          processedCount++;
        } catch (error) {
          const errorMsg = `处理服务器 ${server.name} 时出错: ${error instanceof Error ? error.message : String(error)}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }));

      // 显示进度
      console.log(`已处理 ${Math.min(i + batchSize, serversToProcess.length)}/${serversToProcess.length} 个服务器`);
    }

    const summary = dryRun 
      ? `[DRY RUN] 分析完成: ${matchResults.length}/${processedCount} 个服务器将获得标签`
      : `处理完成: ${matchResults.length}/${processedCount} 个服务器获得了标签`;
    
    console.log(summary);

    return {
      success: errors.length === 0,
      count: processedCount,
      errors,
      matchResults: dryRun ? matchResults : undefined
    };

  } catch (error) {
    const errorMsg = `执行过程中发生错误: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMsg);
    errors.push(errorMsg);

    return {
      success: false,
      count: processedCount,
      errors,
      matchResults
    };
  }
}

/**
 * 获取服务器的所有标签（包括标签名称）
 */
export async function getServerTagsWithNames(serverId: string): Promise<{
  id: number;
  name: string;
}[]> {
  const { data, error } = await supabase
    .from('server_tags')
    .select(`
      tag_id,
      tags (
        id,
        name
      )
    `)
    .eq('server_id', serverId);

  if (error) {
    throw new Error(`Failed to fetch server tags: ${error.message}`);
  }

  return data?.map(item => ({
    id: item.tag_id,
    name: (item.tags as { id: number; name: string }).name
  })) || [];
}

/**
 * 删除服务器的特定标签
 */
export async function removeServerTag(serverId: string, tagId: number): Promise<void> {
  const { error } = await supabase
    .from('server_tags')
    .delete()
    .eq('server_id', serverId)
    .eq('tag_id', tagId);

  if (error) {
    throw new Error(`Failed to remove tag: ${error.message}`);
  }
}

/**
 * 手动为服务器添加标签
 */
export async function addServerTag(serverId: string, tagId: number): Promise<void> {
  const { error } = await supabase
    .from('server_tags')
    .insert({
      server_id: serverId,
      tag_id: tagId
    });

  if (error) {
    throw new Error(`Failed to add tag: ${error.message}`);
  }
}

// 主函数 - 命令行运行时执行
async function main() {
  const args = process.argv.slice(2);
  
  // 解析命令行参数
  const options: {
    serverId?: string;
    dryRun?: boolean;
    batchSize?: number;
  } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--server-id':
        options.serverId = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--batch-size':
        options.batchSize = parseInt(args[++i], 10);
        break;
      case '--help':
        console.log(`
使用方法: npm run supabase:addtag [选项]

选项:
  --server-id <id>    只处理指定的服务器ID
  --dry-run          只显示匹配结果，不保存到数据库
  --batch-size <n>   批处理大小，默认50
  --help             显示此帮助信息

⚠️  重要说明:
  本脚本会自动清除每个服务器的现有标签，然后重新分配最多5个相关度最高的标签。

功能特点:
  ✅ 智能相关度评分系统 (分数范围: 30-100)
  ✅ 自动限制每个服务器最多5个标签
  ✅ 清除旧标签后重新分配
  ✅ 支持技术栈和框架的特殊匹配规则

示例:
  npm run supabase:addtag                           # 处理所有服务器
  npm run supabase:addtag -- --dry-run             # 预览匹配结果
  npm run supabase:addtag -- --server-id mcp-server-sqlite  # 只处理指定服务器
  npm run supabase:addtag -- --batch-size 100      # 调整批处理大小
        `);
        process.exit(0);
    }
  }

  try {
    console.log('🏷️  开始为MCP服务器重新分配标签...\n');
    
    if (!options.dryRun) {
      console.log('⚠️  注意: 此操作会清除每个服务器的现有标签，重新分配最多5个相关度最高的标签');
      console.log('📋 建议先使用 --dry-run 参数预览结果\n');
    } else {
      console.log('🔍 预览模式: 只显示匹配结果，不会修改数据库\n');
    }
    
    const result = await addTagForServers(options);
    
    if (result.success) {
      console.log(`\n✅ 处理完成！`);
      console.log(`   处理了 ${result.count} 个服务器`);
      if (result.matchResults) {
        console.log(`   ${result.matchResults.length} 个服务器获得了标签匹配`);
        
        // 显示匹配详情（限制显示数量）
        const showCount = Math.min(5, result.matchResults.length);
        console.log(`\n前 ${showCount} 个匹配结果:`);
        result.matchResults.slice(0, showCount).forEach(match => {
          console.log(`\n🔖 服务器: ${match.serverId}`);
          console.log(`   标签数量: ${match.tagIds.length} (限制为最多5个)`);
          if (match.matches && match.matches.length > 0) {
            console.log(`   最佳匹配标签:`);
            match.matches.slice(0, 3).forEach(m => {
              console.log(`     - ${m.tagName} (分数: ${m.score})`);
            });
          } else {
            console.log(`   匹配原因: ${match.matchReasons.slice(0, 3).join('; ')}`);
          }
        });
        
        if (result.matchResults.length > showCount) {
          console.log(`\n... 还有 ${result.matchResults.length - showCount} 个服务器获得了标签`);
        }
      }
    } else {
      console.log(`\n❌ 处理过程中遇到问题:`);
      result.errors.forEach(error => console.log(`   - ${error}`));
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n💥 脚本执行失败:`, error);
    process.exit(1);
  }
}

// 当直接运行此脚本时执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}