#!/usr/bin/env tsx

/**
 * 检查数据库表结构
 * 验证server_readmes表是否包含所需的字段
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少Supabase配置环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema(): Promise<void> {
  console.log('🔍 检查server_readmes表结构...');
  
  try {
    // 尝试查询表结构
    const { data, error } = await supabase
      .from('server_readmes')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ 查询失败:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      const firstRow = data[0];
      const fields = Object.keys(firstRow);
      
      console.log('📊 当前表字段:');
      fields.forEach(field => {
        console.log(`  ✓ ${field}`);
      });
      
      console.log('\\n🔍 检查必需字段:');
      const requiredFields = [
        'extracted_installation',
        'extracted_api_reference', 
        'extraction_status',
        'extraction_error',
        'extracted_at'
      ];
      
      const missingFields: string[] = [];
      
      requiredFields.forEach(field => {
        if (fields.includes(field)) {
          console.log(`  ✅ ${field} - 存在`);
        } else {
          console.log(`  ❌ ${field} - 缺失`);
          missingFields.push(field);
        }
      });
      
      if (missingFields.length > 0) {
        console.log('\\n⚠️  需要添加以下字段:');
        console.log('\\n请在Supabase控制台的SQL编辑器中执行以下语句:');
        console.log('\\n```sql');
        
        if (missingFields.includes('extracted_installation')) {
          console.log('ALTER TABLE server_readmes ADD COLUMN extracted_installation JSONB;');
        }
        if (missingFields.includes('extracted_api_reference')) {
          console.log('ALTER TABLE server_readmes ADD COLUMN extracted_api_reference JSONB;');
        }
        if (missingFields.includes('extraction_status')) {
          console.log('ALTER TABLE server_readmes ADD COLUMN extraction_status VARCHAR(20) DEFAULT \'pending\';');
        }
        if (missingFields.includes('extraction_error')) {
          console.log('ALTER TABLE server_readmes ADD COLUMN extraction_error TEXT;');
        }
        if (missingFields.includes('extracted_at')) {
          console.log('ALTER TABLE server_readmes ADD COLUMN extracted_at TIMESTAMP WITH TIME ZONE;');
        }
        
        console.log('\\n-- 创建索引');
        console.log('CREATE INDEX idx_server_readmes_extraction_status ON server_readmes(extraction_status);');
        console.log('CREATE INDEX idx_server_readmes_extracted_at ON server_readmes(extracted_at);');
        
        console.log('\\n-- 更新现有记录');
        console.log('UPDATE server_readmes SET extraction_status = \'pending\' WHERE extraction_status IS NULL;');
        
        console.log('```');
        
        console.log('\\n📍 Supabase控制台地址:');
        console.log('   1. 访问: https://supabase.com/dashboard');
        console.log('   2. 选择你的项目');
        console.log('   3. 点击左侧菜单 "SQL Editor"');
        console.log('   4. 创建新查询并粘贴上面的SQL');
        console.log('   5. 点击 "Run" 执行');
        
      } else {
        console.log('\\n🎉 所有必需字段都存在！可以运行README分析脚本了。');
      }
      
    } else {
      console.log('⚠️  server_readmes表为空，无法检查字段结构');
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

async function main(): Promise<void> {
  console.log('=' .repeat(60));
  console.log('📊 Supabase数据库表结构检查');
  console.log('=' .repeat(60));
  
  await checkSchema();
}

main().catch(console.error);