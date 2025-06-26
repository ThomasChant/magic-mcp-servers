import {
  Folder,
  Database,
  MessageCircle,
  Code,
  Brain,
  Search,
  BarChart3,
  Plug,
  CheckSquare,
  Shield,
  FileText,
  Wrench,
  Cloud,
  Briefcase,
  DollarSign,
  Layers,
  type LucideIcon,
} from "lucide-react";

import categoriesJson from "./categories.json";
import featuredServersJson from "./featured-servers.json";

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  serverCount: number;
  tags: string[];
  popularServer?: string;
  color: string;
  featured?: boolean;
}

export interface FeaturedServer {
  name: string;
  icon: LucideIcon;
  rating: number;
  badge: "Official" | "Featured" | "Popular";
  badgeColor: string;
  description: string;
  slug?: string;
}

const iconMap: { [key: string]: LucideIcon } = {
  folder: Folder,
  database: Database,
  messageCircle: MessageCircle,
  code: Code,
  brain: Brain,
  search: Search,
  barChart3: BarChart3,
  plug: Plug,
  checkSquare: CheckSquare,
  shield: Shield,
  fileText: FileText,
  wrench: Wrench,
  cloud: Cloud,
  briefcase: Briefcase,
  dollarSign: DollarSign,
  layers: Layers,
};

// 从JSON导入的原始分类数据的类型
interface RawSubcategory {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
}

interface RawCategoryData {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  icon: string;
  color: string;
  serverCount: number;
  subcategories?: RawSubcategory[];
}

interface CategoryFeatureServer {
  category: string;
  featureServer: FeaturedServer[];
}

/**
 * 将来自JSON的原始分类数据转换为类型化的Category数组，
 * 将基于字符串的图标名称映射到其对应的LucideIcon组件。
 * @param rawCategories - 来自JSON文件的原始分类对象数组。
 * @returns 带有LucideIcon组件的类型化Category对象数组。
 */
function convertCategoryJsonToCategories(
  rawCategories: RawCategoryData[]
): Category[] {
  return rawCategories.map((category) => {
    const iconComponent = iconMap[category.icon];
    if (!iconComponent) {
      console.warn(`未找到分类 "${category.name}" 的图标 "${category.icon}"。将使用默认图标。`);
    }
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      icon: iconComponent || FileText, // 使用映射的图标或默认使用FileText
      gradient: `category-gradient-${category.id}`, // 根据ID生成渐变类名
      serverCount: category.serverCount,
      tags: [], // 从JSON数据中没有tags字段，使用空数组
      color: category.color.replace('#', ''), // 移除颜色值中的#号
    };
  });
}

export const categories: Category[] = convertCategoryJsonToCategories(categoriesJson);

/**
 * 将来自JSON的特色服务器数据转换为类型化的FeaturedServer数组，
 * 将基于字符串的图标名称映射到其对应的LucideIcon组件。
 */
function convertFeaturedServersJson(): Record<string, FeaturedServer[]> {
  const result: Record<string, FeaturedServer[]> = {};
  
  // 创建反向映射：从大写图标名到LucideIcon组件
  const iconNameMap: { [key: string]: LucideIcon } = {
    'Database': Database,
    'Code': Code,
    'Search': Search,
    'MessageCircle': MessageCircle,
    'Brain': Brain,
    'Wrench': Wrench,
    'CheckSquare': CheckSquare,
    'Shield': Shield,
    'FileText': FileText,
    'Cloud': Cloud,
    'Briefcase': Briefcase,
    'DollarSign': DollarSign,
    'Layers': Layers,
    'Folder': Folder,
    'BarChart3': BarChart3,
    'Plug': Plug
  };
  
  Object.entries(featuredServersJson).forEach(([category, servers]) => {
    result[category] = servers.map(server => {
      const iconComponent = iconNameMap[server.icon] || FileText;
      
      // 确保 badge 值符合联合类型
      const validBadge: "Official" | "Featured" | "Popular" = 
        server.badge === "Official" || server.badge === "Featured" || server.badge === "Popular" 
          ? server.badge 
          : "Featured";
      
      return {
        ...server,
        icon: iconComponent,
        badge: validBadge
      };
    });
  });
  
  return result;
}

export const featuredServers: Record<string, FeaturedServer[]> = convertFeaturedServersJson();



export const categoryStats = {
  totalCategories: categories.length,
  totalServers: categories.reduce((sum, cat) => sum + cat.serverCount, 0),
  totalDownloads: "45K+",
  uptime: "98%",
};

// Helper functions
export const getMainCategories = () => categories.filter((cat) => cat.featured);
export const getAdditionalCategories = () => categories.filter((cat) => !cat.featured);
export const getCategoryById = (id: string) => categories.find((cat) => cat.id === id);
export const getFeaturedServersByCategory = (categoryId: string) => featuredServers[categoryId] || [];