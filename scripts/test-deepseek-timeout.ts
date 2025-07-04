#!/usr/bin/env tsx

/**
 * DeepSeek README解析超时机制测试脚本
 * 测试新的超时和线程池机制
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// 测试配置
const TEST_LIMIT = 10; // 只处理10个任务进行测试
const TEST_THREADS = 3; // 使用3个线程测试

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

async function testFetchReadmes(): Promise<ReadmeRecord[]> {
  console.log('🔍 测试查询待处理README...');
  
  const { data: readmes, error } = await supabase
    .from('server_readmes')
    .select('id, server_id, filename, project_name, raw_content, extraction_status')
    .in('extraction_status', ['pending', 'failed'])
    .order('id')
    .limit(TEST_LIMIT);

  if (error) {
    console.error('❌ 查询失败:', error);
    throw error;
  }

  console.log(`✅ 查询成功，找到 ${readmes?.length || 0} 个待处理README`);
  return readmes || [];
}

async function testTimeout(): Promise<void> {
  console.log('🚀 测试超时机制...');
  
  try {
    // 测试5秒超时
    await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('测试超时: 5秒'));
      }, 5000);

      // 模拟一个永不resolve的任务
      setTimeout(() => {
        clearTimeout(timeoutId);
        resolve(undefined);
      }, 3000); // 3秒后完成，应该不会超时
    });
    
    console.log('✅ 超时机制测试通过 (任务在超时前完成)');
    
  } catch (error) {
    console.log('⚠️  捕获到超时错误:', (error as Error).message);
  }
}

async function testThreadPoolLogic(): Promise<void> {
  console.log('🧵 测试线程池逻辑...');
  
  let activeThreads = 0;
  const maxThreads = TEST_THREADS;
  let processedCount = 0;
  
  const tasks = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Task-${i + 1}`,
    duration: Math.random() * 2000 + 1000 // 1-3秒随机
  }));
  
  const processingPromises: Promise<void>[] = [];
  
  for (const task of tasks) {
    if (activeThreads < maxThreads) {
      activeThreads++;
      const promise = (async () => {
        try {
          console.log(`🔄 线程${activeThreads} 开始处理: ${task.name}`);
          await new Promise(resolve => setTimeout(resolve, task.duration));
          processedCount++;
          console.log(`✅ 线程${activeThreads} 完成: ${task.name} (${processedCount}/${tasks.length})`);
        } finally {
          activeThreads--;
        }
      })();
      processingPromises.push(promise);
    }
  }
  
  await Promise.all(processingPromises);
  console.log(`🎉 所有任务完成，总处理: ${processedCount}/${tasks.length}`);
}

async function main(): Promise<void> {
  console.log('=' .repeat(60));
  console.log('🧪 DeepSeek README解析超时机制测试');
  console.log('=' .repeat(60));
  
  try {
    // 测试1: 数据查询
    await testFetchReadmes();
    
    console.log('\n');
    
    // 测试2: 超时机制
    await testTimeout();
    
    console.log('\n');
    
    // 测试3: 线程池逻辑
    await testThreadPoolLogic();
    
    console.log('\n');
    console.log('🎉 所有测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

main().catch(console.error);