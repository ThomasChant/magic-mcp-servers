import { type LucideIcon } from "lucide-react";
import { useSupabaseFeaturedServersByCategory, getSupabaseFeaturedServersByCategory } from "./useSupabaseData";

export interface FeaturedServer {
  name: string;
  icon: LucideIcon;
  rating: number;
  badge: "Official" | "Featured" | "Popular";
  badgeColor: string;
  description: string;
  slug?: string;
}


// Featured servers by category hook - only Supabase implementation
export const useFeaturedServersByCategory = () => {
  return useSupabaseFeaturedServersByCategory();
};

// Enhanced getFeaturedServersByCategory function
export const getFeaturedServersByCategory = (categoryId: string, featuredData?: Record<string, FeaturedServer[]>): FeaturedServer[] => {
  return getSupabaseFeaturedServersByCategory(categoryId, featuredData);
};