import { useCallback, useMemo } from "react";
import { useAuthStatus } from "./useAuthStatus";

// 导出接口类型以供其他组件使用
export interface FavoritesSyncStatus {
    isOnline: boolean;
    lastSynced: string | null;
    favoritesLoading: boolean;
    favoritesError: string | null;
    retrySync: () => Promise<void>;
    forceSync: () => Promise<void>;
    isSignedIn: boolean;
    hasService: boolean;
    syncEnabled: boolean;
    authState: 'not-authenticated' | 'authenticated-limited' | 'authenticated-full';
    displayMessage: string | null;
}

/**
 * @hook useFavoritesSync
 * @description 智能收藏同步Hook，根据认证状态提供不同功能
 * - 未登录：本地存储模式
 * - 已登录受限：本地存储模式，但提示功能受限
 * - 已登录完整：尝试使用云端同步（如果可用）
 */
export function useFavoritesSync(): FavoritesSyncStatus {
    const authStatus = useAuthStatus();
    
    // 提供空操作的回调，保持接口一致
    const retrySync = useCallback(async () => {
        // No-op when Clerk is not available or user not signed in
        if (authStatus.state !== 'authenticated-full') {
            console.log('Sync not available in current auth state:', authStatus.state);
            return;
        }
        // TODO: 实际的同步逻辑
    }, [authStatus.state]);

    const forceSync = useCallback(async () => {
        // No-op when Clerk is not available or user not signed in
        if (authStatus.state !== 'authenticated-full') {
            console.log('Force sync not available in current auth state:', authStatus.state);
            return;
        }
        // TODO: 实际的强制同步逻辑
    }, [authStatus.state]);

    return useMemo(() => ({
        isOnline: authStatus.canSync,
        lastSynced: authStatus.canSync ? null : null, // TODO: 实际的同步时间
        favoritesLoading: false,
        favoritesError: null,
        retrySync,
        forceSync,
        isSignedIn: authStatus.isSignedIn,
        hasService: authStatus.hasClerkFeatures,
        syncEnabled: authStatus.canSync,
        authState: authStatus.state,
        displayMessage: authStatus.displayMessage
    }), [authStatus, retrySync, forceSync]);
}