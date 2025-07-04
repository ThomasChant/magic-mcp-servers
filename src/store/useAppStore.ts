import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SearchFilters, SortOption } from "../types";
import type { Language } from "../types/language";
import type { FavoritesService } from "../services/favorites";

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
    /** @property {'grid' | 'list'} favoriteViewMode - 收藏页面的视图模式。 */
    favoriteViewMode: "grid" | "list";

    // --- 搜索和过滤状态 ---

    /** @property {string} searchQuery - 用于搜索服务器的当前文本查询。 */
    searchQuery: string;
    /** @property {SearchFilters} filters - 当前应用于服务器列表的过滤器。 */
    filters: SearchFilters;
    /** @property {SortOption} sortBy - 服务器列表的当前排序选项。 */
    sortBy: SortOption;

    // --- 收藏功能状态 ---

    /** @property {Set<string>} favorites - 用户收藏的服务器ID集合。 */
    favorites: Set<string>;
    /** @property {boolean} favoritesLoading - 收藏操作进行中的状态。 */
    favoritesLoading: boolean;
    /** @property {string | null} favoritesError - 收藏操作的错误信息。 */
    favoritesError: string | null;
    /** @property {string | null} lastSynced - 上次同步时间。 */
    lastSynced: string | null;
    /** @property {boolean} isOnline - 是否已同步到云端。 */
    isOnline: boolean;

    // --- 操作函数 ---

    /** @method setLanguage - 设置应用语言。 */
    setLanguage: (language: Language) => void;
    /** @method toggleTheme - 在 'light' 和 'dark' 之间切换应用主题。 */
    toggleTheme: () => void;
    /** @method toggleSidebar - 切换侧边栏的可见性。 */
    toggleSidebar: () => void;
    /** @method setFavoriteViewMode - 设置收藏页面的视图模式。 */
    setFavoriteViewMode: (mode: "grid" | "list") => void;
    /** @method setSearchQuery - 设置搜索查询文本。 */
    setSearchQuery: (query: string) => void;
    /** @method setFilters - 设置搜索过滤器。 */
    setFilters: (filters: SearchFilters) => void;
    /** @method setSortBy - 设置排序选项。 */
    setSortBy: (sortBy: SortOption) => void;
    /** @method clearFilters - 将所有过滤器和搜索查询重置为其默认状态。 */
    clearFilters: () => void;

    // --- 收藏功能操作函数 ---

    /** @method addToFavorites - 将服务器添加到收藏列表。 */
    addToFavorites: (serverId: string, favoritesService?: FavoritesService | null) => Promise<void>;
    /** @method removeFromFavorites - 从收藏列表中移除服务器。 */
    removeFromFavorites: (serverId: string, favoritesService?: FavoritesService | null) => Promise<void>;
    /** @method toggleFavorite - 切换服务器的收藏状态。 */
    toggleFavorite: (serverId: string, favoritesService?: FavoritesService | null) => Promise<void>;
    /** @method isFavorite - 检查服务器是否已收藏。 */
    isFavorite: (serverId: string) => boolean;
    /** @method clearFavorites - 清空所有收藏。 */
    clearFavorites: (favoritesService?: FavoritesService | null) => Promise<void>;
    /** @method syncFavorites - 同步收藏数据。 */
    syncFavorites: (favoritesService?: FavoritesService | null) => Promise<void>;
    /** @method setFavorites - 设置收藏列表（用于同步）。 */
    setFavorites: (favorites: string[]) => void;
    /** @method clearFavoritesError - 清除收藏错误状态。 */
    clearFavoritesError: () => void;
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
        (set, get) => ({
            // 初始状态定义
            language: "en",
            theme: "light",
            sidebarOpen: false,
            favoriteViewMode: "grid",
            searchQuery: "",
            filters: {},
            sortBy: {
                key: "quality",
                label: "Quality Score",
                direction: "desc",
            },
            favorites: new Set<string>(),
            favoritesLoading: false,
            favoritesError: null,
            lastSynced: null,
            isOnline: false,

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

            setFavoriteViewMode: (mode) => set({ favoriteViewMode: mode }),

            setSearchQuery: (searchQuery) => set({ searchQuery }),

            setFilters: (filters) => set({ filters }),

            setSortBy: (sortBy) => set({ sortBy }),

            clearFilters: () =>
                set({
                    filters: {},
                    searchQuery: "",
                }),

            // 收藏功能的具体实现
            addToFavorites: async (serverId, favoritesService) => {
                const state = get();
                
                // 避免重复添加
                if (state.favorites.has(serverId)) {
                    return;
                }

                // 立即更新本地状态
                set((state) => ({
                    favorites: new Set([...state.favorites, serverId]),
                    favoritesLoading: true,
                    favoritesError: null,
                }));

                // 如果有服务且用户已登录，同步到云端
                if (favoritesService) {
                    try {
                        await favoritesService.addToFavorites(serverId);
                        set({
                            favoritesLoading: false,
                            lastSynced: new Date().toISOString(),
                            isOnline: true,
                        });
                    } catch (error) {
                        console.error("Failed to sync favorite to cloud:", error);
                        set({
                            favoritesLoading: false,
                            favoritesError: error instanceof Error ? error.message : "Failed to sync to cloud",
                            isOnline: false,
                        });
                    }
                } else {
                    set({ favoritesLoading: false });
                }
            },

            removeFromFavorites: async (serverId, favoritesService) => {
                const state = get();
                
                // 如果不存在，直接返回
                if (!state.favorites.has(serverId)) {
                    return;
                }

                // 立即更新本地状态
                const newFavorites = new Set(state.favorites);
                newFavorites.delete(serverId);
                set({
                    favorites: newFavorites,
                    favoritesLoading: true,
                    favoritesError: null,
                });

                // 如果有服务且用户已登录，同步到云端
                if (favoritesService) {
                    try {
                        await favoritesService.removeFromFavorites(serverId);
                        set({
                            favoritesLoading: false,
                            lastSynced: new Date().toISOString(),
                            isOnline: true,
                        });
                    } catch (error) {
                        console.error("Failed to sync favorite removal to cloud:", error);
                        set({
                            favoritesLoading: false,
                            favoritesError: error instanceof Error ? error.message : "Failed to sync to cloud",
                            isOnline: false,
                        });
                    }
                } else {
                    set({ favoritesLoading: false });
                }
            },

            toggleFavorite: async (serverId, favoritesService) => {
                const state = get();
                if (state.favorites.has(serverId)) {
                    await state.removeFromFavorites(serverId, favoritesService);
                } else {
                    await state.addToFavorites(serverId, favoritesService);
                }
            },

            isFavorite: (serverId) => {
                const state = get();
                return state.favorites.has(serverId);
            },

            clearFavorites: async (favoritesService) => {
                set({
                    favorites: new Set<string>(),
                    favoritesLoading: true,
                    favoritesError: null,
                });

                // 如果有服务且用户已登录，同步到云端
                if (favoritesService) {
                    try {
                        await favoritesService.clearFavorites();
                        set({
                            favoritesLoading: false,
                            lastSynced: new Date().toISOString(),
                            isOnline: true,
                        });
                    } catch (error) {
                        console.error("Failed to sync clear favorites to cloud:", error);
                        set({
                            favoritesLoading: false,
                            favoritesError: error instanceof Error ? error.message : "Failed to sync to cloud",
                            isOnline: false,
                        });
                    }
                } else {
                    set({ favoritesLoading: false });
                }
            },

            syncFavorites: async (favoritesService) => {
                if (!favoritesService) {
                    set({ isOnline: false });
                    return;
                }

                set({ favoritesLoading: true, favoritesError: null });

                try {
                    const currentFavoritesArray = Array.from(get().favorites);
                    const syncedFavorites = await favoritesService.syncWithLocal(currentFavoritesArray);
                    
                    set({
                        favorites: new Set(syncedFavorites),
                        favoritesLoading: false,
                        lastSynced: new Date().toISOString(),
                        isOnline: true,
                    });
                } catch (error) {
                    console.error("Failed to sync favorites:", error);
                    set({
                        favoritesLoading: false,
                        favoritesError: error instanceof Error ? error.message : "Failed to sync favorites",
                        isOnline: false,
                    });
                }
            },

            setFavorites: (favorites) => {
                set({ favorites: new Set(favorites) });
            },

            clearFavoritesError: () => {
                set({ favoritesError: null });
            },
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
                favoriteViewMode: state.favoriteViewMode,
                filters: state.filters,
                sortBy: state.sortBy,
                favorites: Array.from(state.favorites),
                lastSynced: state.lastSynced,
                isOnline: state.isOnline,
            }),

            /**
             * @function onRehydrateStorage
             * @description 在从存储恢复状态时的回调函数。
             * 用于将数组形式的收藏列表转换回Set类型。
             */
            onRehydrateStorage: () => (state) => {
                if (state) {
                    // 将数组形式的收藏列表转换回Set类型
                    if (Array.isArray(state.favorites)) {
                        state.favorites = new Set(state.favorites);
                    }
                    // 初始化运行时状态（不持久化的状态）
                    state.favoritesLoading = false;
                    state.favoritesError = null;
                }
            },
        }
    )
);
