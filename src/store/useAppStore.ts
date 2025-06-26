import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SearchFilters, SortOption } from "../types";
import type { Language } from "../types/language";

/**
 * @interface AppStore
 * @description 定义应用全局状态存储的结构。
 * 包含UI状态、搜索和过滤设置，以及操作这些状态的函数。
 */
interface AppStore {
    // --- UI状态 ---

    /** @property {Language} language - 当前选择的应用语言。 */
    language: Language;
    /** @property {'light' | 'dark'} theme - 应用当前的颜色主题。 */
    theme: "light" | "dark";
    /** @property {boolean} sidebarOpen - 侧边栏的可见状态。 */
    sidebarOpen: boolean;

    // --- 搜索和过滤状态 ---

    /** @property {string} searchQuery - 用于搜索服务器的当前文本查询。 */
    searchQuery: string;
    /** @property {SearchFilters} filters - 当前应用于服务器列表的过滤器。 */
    filters: SearchFilters;
    /** @property {SortOption} sortBy - 服务器列表的当前排序选项。 */
    sortBy: SortOption;

    // --- 操作函数 ---

    /** @method setLanguage - 设置应用语言。 */
    setLanguage: (language: Language) => void;
    /** @method toggleTheme - 在 'light' 和 'dark' 之间切换应用主题。 */
    toggleTheme: () => void;
    /** @method toggleSidebar - 切换侧边栏的可见性。 */
    toggleSidebar: () => void;
    /** @method setSearchQuery - 设置搜索查询文本。 */
    setSearchQuery: (query: string) => void;
    /** @method setFilters - 设置搜索过滤器。 */
    setFilters: (filters: SearchFilters) => void;
    /** @method setSortBy - 设置排序选项。 */
    setSortBy: (sortBy: SortOption) => void;
    /** @method clearFilters - 将所有过滤器和搜索查询重置为其默认状态。 */
    clearFilters: () => void;
}

/**
 * @function useAppStore
 * @description 用于访问全局应用状态的自定义 Hook。
 * 此 store 使用 Zustand 创建，并包含持久化中间件。
 * @see https://github.com/pmndrs/zustand
 */
export const useAppStore = create<AppStore>()(
    /**
     * @function persist
     * @description Zustand 中间件，用于将 store 的状态持久化到存储介质（例如 localStorage）。
     * @param {Function} setup - 用于设置 store 状态和操作的函数。
     * @param {Object} options - 持久化中间件的配置选项。
     */
    persist(
        /**
         * @param {Function} set - Zustand 的状态设置函数。
         * @returns {Object} store 的初始状态和操作。
         */
        (set) => ({
            // 初始状态定义
            language: "en",
            theme: "light",
            sidebarOpen: false,
            searchQuery: "",
            filters: {},
            sortBy: {
                key: "quality",
                label: "Quality Score",
                direction: "desc",
            },

            // 操作函数的具体实现
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
            /** @property {string} name - 用于在存储中保存数据的键名。 */
            name: "mcp-hub-storage",

            /** @property {Function} storage - 指定存储介质。此处配置为使用浏览器的 localStorage。 */
            storage: createJSONStorage(() => localStorage),

            /**
             * @function partialize
             * @description 一个选择性持久化部分状态的函数。
             * 只有返回的属性才会被保存。
             * @param {AppStore} state - store 的完整状态。
             * @returns {Object} 需要被持久化的状态子集。
             */
            partialize: (state) => ({
                language: state.language,
                theme: state.theme,
                filters: state.filters,
                sortBy: state.sortBy,
            }),
        }
    )
);
