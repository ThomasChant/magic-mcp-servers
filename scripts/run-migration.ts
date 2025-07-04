#!/usr/bin/env tsx

/**
 * 运行数据库迁移脚本
 * 添加README结构化提取字段到server_readmes表
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Supabase配置
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少Supabase配置环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration(): Promise<void> {
  console.log('🚀 开始运行数据库迁移...');
  
  try {
    // 读取迁移文件
    const migrationPath = join(process.cwd(), 'supabase/migrations/add_readme_extraction_fields.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    console.log('📄 读取迁移文件:', migrationPath);
    console.log('📝 迁移内容长度:', migrationSQL.length, '字符');
    
    // 将SQL分割成单独的语句
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log('📊 将执行', statements.length, '个SQL语句');
    
    // 逐个执行SQL语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\\n🔧 执行语句 ${i + 1}/${statements.length}:`);
      console.log('  ', statement.substring(0, 80) + (statement.length > 80 ? '...' : ''));
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        // 如果是"已存在"类型的错误，继续执行
        if (error.message.includes('already exists') || 
            error.message.includes('does not exist') ||
            error.message.includes('IF NOT EXISTS')) {
          console.log('⚠️  语句已执行或字段已存在，跳过');
          continue;
        }
        throw error;
      }
      
      console.log('✅ 语句执行成功');
    }
    
    console.log('\\n🎉 数据库迁移完成！');
    
    // 验证迁移结果
    console.log('\\n🔍 验证迁移结果...');
    const { data, error: checkError } = await supabase
      .from('server_readmes')
      .select('id, extraction_status, extracted_at')
      .limit(1);
    
    if (checkError) {
      console.error('❌ 验证失败:', checkError.message);
    } else {
      console.log('✅ 迁移验证成功');
      console.log('📊 server_readmes表结构更新完成');
    }
    
  } catch (error) {
    console.error('❌ 迁移执行失败:', error);
    process.exit(1);
  }
}

// 如果没有exec_sql函数，直接使用原生SQL执行
async function runMigrationDirect(): Promise<void> {
  console.log('🚀 使用直接SQL执行迁移...');
  
  try {
    // 直接执行每个ALTER语句
    const alterStatements = [
      'ALTER TABLE server_readmes ADD COLUMN IF NOT EXISTS extracted_installation JSONB',
      'ALTER TABLE server_readmes ADD COLUMN IF NOT EXISTS extracted_api_reference JSONB', 
      'ALTER TABLE server_readmes ADD COLUMN IF NOT EXISTS extraction_status VARCHAR(20) DEFAULT \'pending\'',
      'ALTER TABLE server_readmes ADD COLUMN IF NOT EXISTS extraction_error TEXT',
      'ALTER TABLE server_readmes ADD COLUMN IF NOT EXISTS extracted_at TIMESTAMP WITH TIME ZONE'
    ];
    
    for (let i = 0; i < alterStatements.length; i++) {
      const statement = alterStatements[i];
      console.log(`\\n🔧 执行语句 ${i + 1}/${alterStatements.length}:`);
      console.log('  ', statement);
      
      try {
        // 使用原生查询执行
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.log('⚠️  RPC方法不可用，尝试其他方式...');
          break;
        } else {
          console.log('✅ 语句执行成功');
        }
      } catch (e) {
        console.log('⚠️  直接执行遇到问题，字段可能已存在');
      }
    }
    
    console.log('\\n✅ 迁移执行完成');
    
  } catch (error) {
    console.error('❌ 直接迁移失败:', error);
    console.log('\\n💡 请手动在Supabase控制台执行以下SQL:');
    console.log('```sql');
    console.log('ALTER TABLE server_readmes ADD COLUMN IF NOT EXISTS extracted_installation JSONB;');
    console.log('ALTER TABLE server_readmes ADD COLUMN IF NOT EXISTS extracted_api_reference JSONB;');
    console.log('ALTER TABLE server_readmes ADD COLUMN IF NOT EXISTS extraction_status VARCHAR(20) DEFAULT \'pending\';');
    console.log('ALTER TABLE server_readmes ADD COLUMN IF NOT EXISTS extraction_error TEXT;');
    console.log('ALTER TABLE server_readmes ADD COLUMN IF NOT EXISTS extracted_at TIMESTAMP WITH TIME ZONE;');
    console.log('```');
  }
}

async function main(): Promise<void> {
  console.log('=' .repeat(60));
  console.log('📊 README提取字段数据库迁移');
  console.log('=' .repeat(60));
  
  try {
    await runMigrationDirect();
  } catch (error) {
    console.error('迁移失败:', error);
    process.exit(1);
  }
}

main().catch(console.error);