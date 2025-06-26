import { useQuery } from "@tanstack/react-query";
import { getIcon } from "../utils/iconMapping";
import { type LucideIcon } from "lucide-react";

export interface Subcategory {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
}

export interface CategoryData {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  color: string;
  serverCount: number;
  subcategories: Subcategory[];
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: LucideIcon;
  color: string;
  serverCount: number;
  subcategories: Subcategory[];
  gradient: string;
}

const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch("/data/categories.json");
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  
  const data: CategoryData[] = await response.json();
  
  // Transform the data to include icon components and gradients
  return data.map((category) => ({
    ...category,
    icon: getIcon(category.icon),
    gradient: `bg-gradient-to-br from-[${category.color}] to-[${category.color}]/80`,
  }));
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};