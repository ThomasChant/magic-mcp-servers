# 数据库设置指南 - DeepSeek README分析

## 🚨 重要提示

在运行DeepSeek README分析脚本之前，需要先在数据库中添加必需的字段。

## 📋 设置步骤

### 步骤1: 检查当前数据库状态

运行以下命令检查数据库结构：
```bash
npm run db:check-schema
```

### 步骤2: 添加必需字段

请按照以下步骤在Supabase控制台执行SQL语句：

#### 2.1 访问Supabase控制台
1. 打开浏览器访问: https://supabase.com/dashboard
2. 登录你的账号
3. 选择你的项目
4. 点击左侧菜单的 **"SQL Editor"**

#### 2.2 执行SQL语句
在SQL编辑器中创建新查询，粘贴以下SQL代码并执行：

```sql
-- 添加README结构化提取字段
ALTER TABLE server_readmes ADD COLUMN extracted_installation JSONB;
ALTER TABLE server_readmes ADD COLUMN extracted_api_reference JSONB;
ALTER TABLE server_readmes ADD COLUMN extraction_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE server_readmes ADD COLUMN extraction_error TEXT;
ALTER TABLE server_readmes ADD COLUMN extracted_at TIMESTAMP WITH TIME ZONE;

-- 创建索引以提高查询性能
CREATE INDEX idx_server_readmes_extraction_status ON server_readmes(extraction_status);
CREATE INDEX idx_server_readmes_extracted_at ON server_readmes(extracted_at);

-- 更新现有记录的状态
UPDATE server_readmes SET extraction_status = 'pending' WHERE extraction_status IS NULL;

-- 添加约束检查
ALTER TABLE server_readmes ADD CONSTRAINT check_extraction_status 
CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed'));
```

#### 2.3 验证执行结果
执行SQL后，你应该看到类似如下的成功消息：
- "ALTER TABLE" (执行了5次)
- "CREATE INDEX" (执行了2次)
- "UPDATE X" (更新了X行记录)
- "ALTER TABLE" (添加了约束)

### 步骤3: 验证设置

再次运行检查命令验证设置：
```bash
npm run db:check-schema
```

成功的输出应该显示：
```
🎉 所有必需字段都存在！可以运行README分析脚本了。
```

## 📊 字段说明

添加的新字段用途如下：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `extracted_installation` | JSONB | 存储提取的安装信息（方法、配置、先决条件等） |
| `extracted_api_reference` | JSONB | 存储提取的API参考信息（工具、参数、示例等） |
| `extraction_status` | VARCHAR(20) | 处理状态：pending/processing/completed/failed |
| `extraction_error` | TEXT | 处理失败时的错误信息 |
| `extracted_at` | TIMESTAMP | 提取完成的时间戳 |

## 🔍 故障排除

### 如果SQL执行失败

1. **权限错误**: 确保你使用的是项目的管理员账号
2. **字段已存在**: 如果提示字段已存在，可以忽略，继续执行剩余语句
3. **语法错误**: 确保完整复制了所有SQL语句，包括分号

### 如果仍然有问题

1. 检查Supabase项目是否选择正确
2. 确认 `.env.local` 文件中的数据库配置正确
3. 尝试刷新Supabase控制台页面

## ✅ 完成后的下一步

数据库设置完成后，你就可以运行DeepSeek README分析了：

```bash
# 1. 测试API连接
npm run claude:test-deepseek

# 2. 运行README分析
npm run claude:parse-readmes-deepseek
```

## 📝 注意事项

- 这些字段只需要添加一次
- 现有的README数据不会丢失
- 新字段会自动为现有记录设置默认值
- 索引将提高查询性能

---

如有问题，请检查项目文档或联系开发团队。