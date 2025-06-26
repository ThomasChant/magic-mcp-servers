import { useQuery } from "@tanstack/react-query";
import { type LucideIcon, Database, Code, Search, MessageCircle, Brain, Wrench, CheckSquare, Shield, FileText, Cloud, Briefcase, DollarSign, Layers, Folder, BarChart3, Plug } from "lucide-react";

export interface FeaturedServer {
  name: string;
  icon: LucideIcon;
  rating: number;
  badge: "Official" | "Featured" | "Popular";
  badgeColor: string;
  description: string;
  slug?: string;
}

interface RawFeaturedServer {
  name: string;
  icon: string;
  rating: number;
  badge: string;
  badgeColor: string;
  description: string;
  slug?: string;
}

// Icon name mapping
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

export const useFeaturedServersByCategory = () => {
  return useQuery({
    queryKey: ["featured-servers"],
    queryFn: async (): Promise<Record<string, FeaturedServer[]>> => {
      const response = await fetch("/data/featured-servers.json");
      if (!response.ok) {
        throw new Error("Failed to fetch featured servers");
      }
      
      const rawData: Record<string, RawFeaturedServer[]> = await response.json();
      const result: Record<string, FeaturedServer[]> = {};
      
      // Transform raw data to include LucideIcon components
      Object.entries(rawData).forEach(([category, servers]) => {
        result[category] = servers.map(server => {
          const iconComponent = iconNameMap[server.icon] || FileText;
          
          // Ensure badge value conforms to union type
          const validBadge: "Official" | "Featured" | "Popular" = 
            server.badge === "Official" || server.badge === "Featured" || server.badge === "Popular" 
              ? server.badge as "Official" | "Featured" | "Popular"
              : "Featured";
          
          return {
            ...server,
            icon: iconComponent,
            badge: validBadge
          };
        });
      });
      
      // Store in window for backward compatibility with getFeaturedServersByCategory
      if (typeof window !== 'undefined') {
        const windowWithServers = window as { __featuredServers?: Record<string, FeaturedServer[]> };
        windowWithServers.__featuredServers = result;
      }
      
      return result;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const getFeaturedServersByCategory = (categoryId: string, featuredData?: Record<string, FeaturedServer[]>): FeaturedServer[] => {
  if (featuredData) {
    return featuredData[categoryId] || [];
  }
  
  // Fallback to window object if data was loaded
  if (typeof window !== 'undefined') {
    const windowWithServers = window as { __featuredServers?: Record<string, FeaturedServer[]> };
    return windowWithServers.__featuredServers?.[categoryId] || [];
  }
  
  return [];
};