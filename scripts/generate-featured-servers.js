import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取服务器数据
const serversPath = path.join(__dirname, '../public/data/servers-core.json');
const serversData = JSON.parse(fs.readFileSync(serversPath, 'utf8'));

// 图标映射 - 根据分类映射到对应的图标名称
const categoryIconMap = {
  'database': 'Database',
  'development': 'Code',
  'communication': 'MessageCircle',
  'web-network': 'Search',
  'ai-ml': 'Brain',
  'automation': 'Wrench',
  'productivity': 'CheckSquare',
  'security': 'Shield',
  'content-media': 'FileText',
  'cloud-services': 'Cloud',
  'business': 'Briefcase',
  'finance': 'DollarSign',
  'infrastructure': 'Layers',
  'filesystem': 'Folder'
};

// 统计每个分类的特色服务器
function generateFeaturedServers() {
  const featuredByCategory = {};
  
  // 按分类分组服务器
  const serversByCategory = {};
  serversData.forEach(server => {
    if (!serversByCategory[server.category]) {
      serversByCategory[server.category] = [];
    }
    serversByCategory[server.category].push(server);
  });
  
  // 为每个分类选择特色服务器
  Object.keys(serversByCategory).forEach(category => {
    const servers = serversByCategory[category];
    
    // 排序规则：featured > verified > qualityScore > stars
    const sortedServers = servers.sort((a, b) => {
      // 优先选择featured服务器
      if (a.featured !== b.featured) {
        return b.featured - a.featured;
      }
      // 然后选择verified服务器
      if (a.verified !== b.verified) {
        return b.verified - a.verified;
      }
      // 按质量分数排序
      if (a.qualityScore !== b.qualityScore) {
        return b.qualityScore - a.qualityScore;
      }
      // 最后按星标数排序
      return b.stats.stars - a.stats.stars;
    });
    
    // 选择前3个作为特色服务器
    const featuredServers = sortedServers.slice(0, 3).map((server, index) => {
      let badge, badgeColor;
      
      if (server.featured) {
        badge = 'Featured';
        badgeColor = 'green';
      } else if (server.verified) {
        badge = 'Official';
        badgeColor = 'blue';
      } else {
        badge = 'Popular';
        badgeColor = 'orange';
      }
      
      // 计算评分（基于质量分数和星标数）
      const rating = Math.min(5, Math.max(1, 
        (server.qualityScore / 20) + (server.stats.stars / 10)
      ));
      
      return {
        name: server.name,
        icon: categoryIconMap[category] || 'FileText',
        rating: Math.round(rating * 10) / 10, // 保留一位小数
        badge,
        badgeColor,
        description: server.description,
        slug: server.slug
      };
    });
    
    if (featuredServers.length > 0) {
      featuredByCategory[category] = featuredServers;
    }
  });
  
  return featuredByCategory;
}

// 生成特色服务器数据
const featuredServers = generateFeaturedServers();

// 输出统计信息
console.log('分类统计:');
Object.keys(featuredServers).forEach(category => {
  console.log(`${category}: ${featuredServers[category].length} 个特色服务器`);
});

// 保存到文件
  const outputPath = path.join(__dirname, '../src/data/featured-servers.json');
fs.writeFileSync(outputPath, JSON.stringify(featuredServers, null, 2), 'utf8');

console.log(`\n特色服务器数据已保存到: ${outputPath}`);
console.log(`总共处理了 ${Object.keys(featuredServers).length} 个分类`);