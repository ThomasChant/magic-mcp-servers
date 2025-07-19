#!/usr/bin/env tsx

/**
 * 测试GitHub URL解析逻辑
 */

// 复制修复后的解析逻辑进行测试
function parseGithubUrl(githubUrl: string): { owner: string; repo: string; path?: string; branch?: string } | null {
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
        
        console.log(`✅ 解析成功:`, {
          原始URL: githubUrl,
          解析结果: result,
          推断类型: githubUrl.includes('/blob/') ? 'blob URL' : githubUrl.includes('/tree/') ? 'tree URL' : '仓库URL'
        });
        
        return result;
      }
    }

    console.log(`❌ 无法解析GitHub URL: ${githubUrl}`);
    return null;
  } catch (error) {
    console.error(`❌ GitHub URL解析错误: ${githubUrl}`, error);
    return null;
  }
}

// 测试用例
const testUrls = [
  // 用户报告的问题URL
  'https://github.com/modelcontextprotocol/servers/blob/main/src/time',
  
  // 其他各种URL格式
  'https://github.com/modelcontextprotocol/servers/tree/main/src/google-maps',
  'https://github.com/modelcontextprotocol/servers/blob/main/src/google-maps/README.md',
  'https://github.com/modelcontextprotocol/servers/blob/main/src/google-maps/index.js',
  'https://github.com/modelcontextprotocol/servers',
  'https://github.com/modelcontextprotocol/servers.git',
  'https://github.com/owner/repo/tree/develop',
  'https://github.com/owner/repo/tree/main/docs/api',
  'https://github.com/owner/repo/blob/main/package.json',
  'https://github.com/owner/repo/blob/main/src',
  'https://github.com/owner/repo/blob/main/src/utils',
];

console.log('🧪 测试GitHub URL解析逻辑\n');

testUrls.forEach((url, index) => {
  console.log(`${index + 1}. 测试URL: ${url}`);
  const result = parseGithubUrl(url);
  
  if (result) {
    // 预测API URL
    const { owner, repo, path, branch } = result;
    const targetBranch = branch || 'main';
    const targetPath = path || '';
    const readmeFile = 'README.md';
    const filePath = targetPath ? `${targetPath}/${readmeFile}` : readmeFile;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    
    console.log(`   📍 将查找README: ${apiUrl}`);
  }
  
  console.log('');
});

console.log('✅ 测试完成');

// 特别验证问题URL
console.log('\n🔍 特别验证用户报告的问题URL:');
const problemUrl = 'https://github.com/modelcontextprotocol/servers/blob/main/src/time';
const result = parseGithubUrl(problemUrl);

if (result) {
  console.log('✅ 修复成功!');
  console.log('解析结果:', result);
  console.log('期望行为: 查找 src/time/README.md');
  
  const { owner, repo, path, branch } = result;
  const targetBranch = branch || 'main';
  const targetPath = path || '';
  const readmeFile = 'README.md';
  const filePath = targetPath ? `${targetPath}/${readmeFile}` : readmeFile;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  
  console.log('实际API URL:', apiUrl);
  
  if (filePath === 'src/time/README.md') {
    console.log('🎉 完美！正确识别为目录路径');
  } else {
    console.log('❌ 仍有问题，path应该是 src/time');
  }
} else {
  console.log('❌ 解析失败');
}