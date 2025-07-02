import type { UserResource } from "@clerk/types";

/**
 * @interface FavoritesMetadata
 * @description 存储在 Clerk unsafeMetadata 中的收藏数据结构
 */
export interface FavoritesMetadata {
    servers: string[];           // 收藏的服务器 ID 数组
    lastSynced: string;         // 最后同步时间 (ISO 时间戳)
    version: number;            // 数据版本，用于冲突解决
}

/**
 * @interface FavoritesService
 * @description 收藏服务接口定义
 */
export interface FavoritesService {
    getFavorites(): Promise<string[]>;
    addToFavorites(serverId: string): Promise<void>;
    removeFromFavorites(serverId: string): Promise<void>;
    syncWithLocal(localFavorites: string[]): Promise<string[]>;
    clearFavorites(): Promise<void>;
}

/**
 * @class ClerkFavoritesService
 * @description 基于 Clerk unsafeMetadata 的收藏服务实现
 */
export class ClerkFavoritesService implements FavoritesService {
    private user: UserResource;

    constructor(user: UserResource) {
        this.user = user;
    }

    /**
     * 获取用户收藏列表
     */
    async getFavorites(): Promise<string[]> {
        if (!this.user) {
            throw new Error("User not authenticated");
        }

        const metadata = this.user.unsafeMetadata?.favorites as FavoritesMetadata;
        return metadata?.servers || [];
    }

    /**
     * 添加服务器到收藏列表
     */
    async addToFavorites(serverId: string): Promise<void> {
        if (!this.user) {
            throw new Error("User not authenticated");
        }

        const currentFavorites = await this.getFavorites();
        
        // 避免重复添加
        if (currentFavorites.includes(serverId)) {
            return;
        }

        const newFavorites = [...currentFavorites, serverId];
        await this.updateFavoritesMetadata(newFavorites);
    }

    /**
     * 从收藏列表中移除服务器
     */
    async removeFromFavorites(serverId: string): Promise<void> {
        if (!this.user) {
            throw new Error("User not authenticated");
        }

        const currentFavorites = await this.getFavorites();
        const newFavorites = currentFavorites.filter(id => id !== serverId);
        
        await this.updateFavoritesMetadata(newFavorites);
    }

    /**
     * 与本地收藏数据同步
     * @param localFavorites 本地存储的收藏列表
     * @returns 合并后的收藏列表
     */
    async syncWithLocal(localFavorites: string[]): Promise<string[]> {
        if (!this.user) {
            // 用户未登录，返回本地数据
            return localFavorites;
        }

        try {
            const cloudFavorites = await this.getFavorites();
            
            // 合并本地和云端数据，去重
            const mergedFavorites = Array.from(new Set([...cloudFavorites, ...localFavorites]));
            
            // 如果有新数据需要同步到云端
            if (mergedFavorites.length > cloudFavorites.length) {
                await this.updateFavoritesMetadata(mergedFavorites);
            }
            
            return mergedFavorites;
        } catch (error) {
            console.warn("Failed to sync favorites with cloud, using local data:", error);
            return localFavorites;
        }
    }

    /**
     * 清空所有收藏
     */
    async clearFavorites(): Promise<void> {
        if (!this.user) {
            throw new Error("User not authenticated");
        }

        await this.updateFavoritesMetadata([]);
    }

    /**
     * 更新 Clerk unsafeMetadata 中的收藏数据
     */
    private async updateFavoritesMetadata(favorites: string[]): Promise<void> {
        const metadata: FavoritesMetadata = {
            servers: favorites,
            lastSynced: new Date().toISOString(),
            version: this.getNextVersion()
        };

        try {
            await this.user.update({
                unsafeMetadata: {
                    ...this.user.unsafeMetadata,
                    favorites: metadata
                }
            });
        } catch (error) {
            console.error("Failed to update favorites metadata:", error);
            throw new Error("Failed to sync favorites to cloud");
        }
    }

    /**
     * 获取下一个版本号
     */
    private getNextVersion(): number {
        const currentMetadata = this.user.unsafeMetadata?.favorites as FavoritesMetadata;
        return (currentMetadata?.version || 0) + 1;
    }
}

/**
 * @function createFavoritesService
 * @description 创建收藏服务实例的工厂函数
 */
export function createFavoritesService(user: UserResource): FavoritesService {
    return new ClerkFavoritesService(user);
}

/**
 * @hook useFavoritesService
 * @description 获取收藏服务实例的 Hook - 使用Supabase实现
 */
export function useFavoritesService(): FavoritesService | null {
    // Import from supabase-favorites instead
    // This is kept for backward compatibility
    console.warn('useFavoritesService from favorites.ts is deprecated. Use useSupabaseFavoritesService from supabase-favorites.ts');
    return null;
}