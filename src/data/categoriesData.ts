import { type LucideIcon } from "lucide-react";

// Note: These imports will be removed as we use data from public/data directory
// import categoriesJson from "./categories.json";
// import featuredServersJson from "./featured-servers.json";

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

// Icon mapping is now handled in useFeaturedServers.ts for better maintainability

// Types for raw category data - kept for reference
// interface RawSubcategory {
//   id: string;
//   name: string;
//   nameEn?: string;
//   description: string;
//   descriptionEn?: string;
// }

// interface RawCategoryData {
//   id: string;
//   name: string;
//   nameEn?: string;
//   description: string;
//   descriptionEn?: string;
//   icon: string;
//   color: string;
//   serverCount: number;
//   subcategories?: RawSubcategory[];
// }


// These functions are kept for backward compatibility but are no longer used
// The actual data loading happens in the hooks

// Categories will be loaded from public/data/categories.json via useCategories hook
export const categories: Category[] = [];


// Featured servers will be loaded from public/data/featured-servers.json
export const featuredServers: Record<string, FeaturedServer[]> = {};



// Statistics will be calculated dynamically from server data
export const categoryStats = {
  totalCategories: 0,
  totalServers: 0,
  totalDownloads: "0",
  uptime: "0%",
};

// Helper functions - These need to be updated to use dynamic data
export const getMainCategories = () => [];
export const getAdditionalCategories = () => [];
export const getCategoryById = (/* id: string */) => undefined;

// This function will be used to get featured servers from the loaded data
export const getFeaturedServersByCategory = (categoryId: string): FeaturedServer[] => {
  // This function is deprecated and kept for backward compatibility
  // Use useFeaturedServers hook instead for better data management
  if (typeof window !== 'undefined' && (window as { __featuredServers?: Record<string, FeaturedServer[]> }).__featuredServers) {
    const windowWithServers = window as { __featuredServers?: Record<string, FeaturedServer[]> };
    const servers = windowWithServers.__featuredServers?.[categoryId] || [];
    // Servers are already transformed with LucideIcon components
    return servers;
  }
  return [];
};