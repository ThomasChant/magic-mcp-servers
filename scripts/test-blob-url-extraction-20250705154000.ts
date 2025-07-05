import { extractMonorepoName } from '../src/utils/monorepoNameExtractor';

console.log('🧪 测试tree和blob URL提取最后一级目录名...\n');

const testCases = [
  // Tree URL测试（统一逻辑 - 取最后一级目录）
  {
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
    original: 'servers',
    expected: 'filesystem',
    description: 'Tree URL - src/filesystem，应该返回"filesystem"'
  },
  {
    url: 'https://github.com/owner/repo/tree/main/src',
    original: 'repo',
    expected: 'src',
    description: 'Tree URL - 只有src，应该返回"src"'
  },
  {
    url: 'https://github.com/owner/repo/tree/main/packages/mcp-server',
    original: 'repo',
    expected: 'mcp-server',
    description: 'Tree URL - packages/mcp-server，应该返回"mcp-server"'
  },
  
  // Blob URL测试（新逻辑）
  {
    url: 'https://github.com/owner/repo/blob/main/file.ts',
    original: 'repo',
    expected: 'repo',
    description: 'Blob URL - 只有文件，无目录'
  },
  {
    url: 'https://github.com/owner/repo/blob/main/src/file.ts',
    original: 'repo',
    expected: 'src',
    description: 'Blob URL - src/file.ts，应该返回"src"'
  },
  {
    url: 'https://github.com/owner/repo/blob/main/src/components/Button.tsx',
    original: 'repo',
    expected: 'components',
    description: 'Blob URL - src/components/Button.tsx，应该返回"components"'
  },
  {
    url: 'https://github.com/modelcontextprotocol/servers/blob/main/src/filesystem/index.ts',
    original: 'servers',
    expected: 'filesystem',
    description: 'Blob URL - src/filesystem/index.ts，应该返回"filesystem"'
  },
  {
    url: 'https://github.com/owner/repo/blob/main/packages/mcp-server/src/index.ts',
    original: 'repo',
    expected: 'src',
    description: 'Blob URL - packages/mcp-server/src/index.ts，应该返回"src"'
  },
  
  // 边缘情况
  {
    url: 'https://github.com/owner/regular-repo',
    original: 'regular-repo',
    expected: 'regular-repo',
    description: '普通仓库URL - 应该保持原名'
  }
];

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = extractMonorepoName(testCase.url, testCase.original);
  const isPass = result === testCase.expected;
  
  if (isPass) passed++;
  else failed++;
  
  console.log(`${index + 1}. ${isPass ? '✅' : '❌'} ${testCase.description}`);
  console.log(`   URL: ${testCase.url}`);
  console.log(`   Original: "${testCase.original}"`);
  console.log(`   Expected: "${testCase.expected}"`);
  console.log(`   Got: "${result}"`);
  if (!isPass) {
    console.log(`   ⚠️  FAILED: Expected "${testCase.expected}" but got "${result}"`);
  }
  console.log('');
});

console.log('\n📊 Summary:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Total: ${testCases.length}`);

if (failed === 0) {
  console.log('\n🎉 所有测试通过！Tree和Blob URL现在都会正确提取最后一级目录名。');
} else {
  console.log('\n⚠️  部分测试失败，请检查实现。');
  process.exit(1);
}