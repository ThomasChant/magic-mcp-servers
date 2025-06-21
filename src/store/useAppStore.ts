import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SearchFilters, SortOption } from "../types";
import type { Language } from "../types/language";

interface AppStore {
    // UI状态
    language: Language;
    theme: "light" | "dark";
    sidebarOpen: boolean;

    // 搜索状态
    searchQuery: string;
    filters: SearchFilters;
    sortBy: SortOption;

    // 操作函数
    setLanguage: (language: Language) => void;
    toggleTheme: () => void;
    toggleSidebar: () => void;
    setSearchQuery: (query: string) => void;
    setFilters: (filters: SearchFilters) => void;
    setSortBy: (sortBy: SortOption) => void;
    clearFilters: () => void;
}

export const useAppStore = create<AppStore>()(
    persist(
        (set) => ({
            // 初始状态
            language: "zh-CN",
            theme: "light",
            sidebarOpen: false,
            searchQuery: "",
            filters: {},
            sortBy: {
                key: "quality",
                label: "质量评分",
                direction: "desc",
            },

            // 操作函数
            setLanguage: (language) => set({ language }),

            toggleTheme: () =>
                set((state) => ({
                    theme: state.theme === "light" ? "dark" : "light",
                })),

            toggleSidebar: () =>
                set((state) => ({
                    sidebarOpen: !state.sidebarOpen,
                })),

            setSearchQuery: (searchQuery) => set({ searchQuery }),

            setFilters: (filters) => set({ filters }),

            setSortBy: (sortBy) => set({ sortBy }),

            clearFilters: () =>
                set({
                    filters: {},
                    searchQuery: "",
                }),
        }),
        {
            name: "mcp-hub-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                language: state.language,
                theme: state.theme,
                filters: state.filters,
                sortBy: state.sortBy,
            }),
        }
    )
);
