# AI README智能解析指南

## 🚀 概述

本系统支持使用**DeepSeek**或**Google Gemini** AI进行README文档的智能分析和结构化提取。系统会随机选择可用的API进行分析，确保高可用性和负载均衡。

## 🔧 配置步骤

### 1. API密钥配置

在`.env.local`文件中配置至少一个AI API密钥：

```env
# DeepSeek API (推荐 - 快速且成本效益高)
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Gemini API (备选 - Google AI)
GEMINI_API_KEY=your_gemini_api_key_here
```

**获取API密钥：**
- **DeepSeek**: https://platform.deepseek.com/api_keys
- **Gemini**: https://makersuite.google.com/app/apikey

### 2. 数据库准备

确保数据库已经添加必需的字段：

```bash
# 检查数据库结构
npm run db:check-schema

# 如果缺少字段，按照提示在Supabase控制台执行SQL
```

## 📊 功能特性

### 多AI支持
- ✅ **DeepSeek API**: 快速、稳定、成本效益高
- ✅ **Gemini API**: Google的强大AI模型
- ✅ **随机选择**: 每个README随机选择可用的API
- ✅ **自动容错**: 一个API失败时自动使用另一个

### 性能优化
- 🚀 **10线程并发**: 同时处理10个README
- 📄 **分页查询**: 每页100条，避免内存溢出
- ⏱️ **超时保护**: API调用30秒超时，任务3分钟超时
- 🔄 **自动重试**: 失败自动重试3次
- 📊 **实时监控**: 详细的进度跟踪和统计

### 智能提取
提取的结构化数据包括：

**安装信息 (Installation)**:
- 多种安装方法 (npm/pip/docker/uv/smithery/manual)
- 客户端配置 (Claude/VS Code/Cursor/Windsurf/Zed)
- 先决条件和环境变量

**API文档 (API Reference)**:
- 可用工具和功能
- 参数定义和类型
- 使用示例
- 配置选项
- 认证信息

## 🎯 使用方法

### 基本使用

```bash
# 运行AI解析（自动选择可用的API）
npm run claude:parse-readmes-ai
```

### 测试API连接

```bash
# 测试DeepSeek API
npm run claude:test-deepseek

# 测试Gemini API
npm run claude:test-gemini

# 测试超时机制
npm run claude:test-timeout
```

## 📈 运行示例

```
[2025-07-04 15:00:00] ℹ️  INFO: 🚀 AI README智能解析任务开始 (分页+线程池模式)
[2025-07-04 15:00:00] ℹ️  INFO: 环境配置检查
[2025-07-04 15:00:00] 📄 DATA: {
  "hasDeepSeek": true,
  "hasGemini": true,
  "hasSupabaseUrl": true,
  "hasSupabaseKey": true
}

[2025-07-04 15:00:01] ℹ️  INFO: 任务概览
[2025-07-04 15:00:01] 📄 DATA: {
  "totalReadmes": 1636,
  "pageSize": 100,
  "totalPages": 17,
  "maxThreads": 10,
  "estimatedDuration": "49分钟"
}

[2025-07-04 15:00:05] ℹ️  INFO: 随机选择API: deepseek
[2025-07-04 15:00:10] ✅ SUCCESS: Installation分析完成: mcp-server-example (deepseek)
[2025-07-04 15:00:15] ℹ️  INFO: 随机选择API: gemini
[2025-07-04 15:00:20] ✅ SUCCESS: API Reference分析完成: another-server (gemini)
```

## 🔍 监控和统计

运行结束后会显示详细统计：

```
[2025-07-04 15:50:00] ✅ SUCCESS: 🎉 AI README智能解析任务完成
[2025-07-04 15:50:00] 📄 DATA: {
  "totalProcessed": 1636,
  "successCount": 1600,
  "failureCount": 36,
  "successRate": "98%",
  "throughput": "33 README/分钟"
}

[2025-07-04 15:50:00] ℹ️  INFO: 📊 API使用统计
[2025-07-04 15:50:00] 📄 DATA: {
  "deepseek": {
    "attempts": 820,
    "successes": 800,
    "failures": 20
  },
  "gemini": {
    "attempts": 816,
    "successes": 800,
    "failures": 16
  },
  "deepseekSuccessRate": "98%",
  "geminiSuccessRate": "98%"
}
```

## ⚠️ 注意事项

### API限制
- **DeepSeek**: 通常没有严格的速率限制
- **Gemini**: 免费版每分钟60次请求限制

### 错误处理
- 自动重试失败的请求
- 30秒无进展会自动终止卡死的任务
- 失败的任务会标记为`failed`状态，可以重新运行

### 成本考虑
- DeepSeek通常更便宜
- Gemini有免费配额但有速率限制
- 建议同时配置两个API以获得最佳性能

## 🛠️ 故障排除

### 常见问题

1. **API密钥无效**
   - 检查`.env.local`中的密钥是否正确
   - 运行测试脚本验证连接

2. **处理卡死**
   - 脚本有30秒无进展检测
   - 会自动终止并报告状态

3. **解析失败**
   - 检查README内容是否过于复杂
   - 查看`extraction_error`字段了解详情

4. **速率限制**
   - 减少线程数或添加延迟
   - 使用多个API分散负载

## 📝 总结

本系统通过集成多个AI API，实现了高效、可靠的README智能解析。随机API选择机制确保了系统的高可用性，而10线程并发处理大大提高了处理效率。完善的错误处理和监控机制让整个过程透明可控。