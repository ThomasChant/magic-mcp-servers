import { useEffect, useCallback, useRef, useMemo } from "react";
import { useUser } from "@clerk/clerk-react";
import { useAppStore } from "../store/useAppStore";
import { useSupabaseFavoritesService } from "../services/supabase-favorites";

/**
 * @hook useFavoritesSyncSafe
 * @description 安全版本的收藏同步Hook，不依赖ClerkProvider
 * 只提供本地收藏功能，不包含云端同步
 */
export function useFavoritesSyncSafe() {
    // 提供空操作的回调，保持接口一致
    const retrySync = useCallback(async () => {
        // No-op when Clerk is not available
    }, []);

    const forceSync = useCallback(async () => {
        // No-op when Clerk is not available
    }, []);

    return useMemo(() => ({
        isOnline: false, // Always false when not using Clerk
        lastSynced: null,
        favoritesLoading: false,
        favoritesError: null,
        retrySync,
        forceSync,
        isSignedIn: false,
        hasService: false,
        syncEnabled: false
    }), [retrySync, forceSync]);
}

/**
 * @hook useFavoritesSyncWithClerk
 * @description 完整版本的收藏同步Hook，需要ClerkProvider
 * 提供完整的云端同步功能
 */
export function useFavoritesSyncWithClerk() {
    // 这里我们可以安全地使用Clerk hooks，因为这个hook只在ClerkProvider存在时被调用
    const isClient = typeof window !== 'undefined';
    const userResult = useUser();
    const isSignedIn = isClient ? userResult.isSignedIn : false;
    const favoritesService = useSupabaseFavoritesService();
    const { 
        isOnline, 
        lastSynced, 
        favoritesLoading,
        favoritesError
    } = useAppStore();

    // 使用ref存储favoritesService，避免依赖数组问题
    const favoritesServiceRef = useRef(favoritesService);
    const hasSyncedOnSignIn = useRef(false);
    const hasHandledSignOut = useRef(false);
    const previousIsSignedIn = useRef(isSignedIn);
    
    // 更新ref中的service引用
    favoritesServiceRef.current = favoritesService;

    /**
     * 监听isOnline状态变化，重置同步标志
     */
    useEffect(() => {
        if (!isOnline) {
            hasSyncedOnSignIn.current = false;
            hasHandledSignOut.current = false;
        }
    }, [isOnline]);

    /**
     * 监听用户登录状态变化
     */
    useEffect(() => {
        // 只在登录状态实际发生变化时才执行
        const wasSignedIn = previousIsSignedIn.current;
        previousIsSignedIn.current = isSignedIn;
        
        if (isSignedIn && !wasSignedIn) {
            // 从未登录变为登录状态
            console.log("User just signed in, syncing favorites...");
            hasHandledSignOut.current = false;
            const service = favoritesServiceRef.current;
            if (service && !hasSyncedOnSignIn.current) {
                const currentLocalFavorites = Array.from(useAppStore.getState().favorites);
                console.log("Current local favorites before sync:", currentLocalFavorites);
                
                useAppStore.getState().syncFavorites(service)
                    .then(() => {
                        hasSyncedOnSignIn.current = true;
                        const syncedFavorites = Array.from(useAppStore.getState().favorites);
                        console.log("Favorites after sync:", syncedFavorites);
                    })
                    .catch(error => {
                        console.error("Failed to sync favorites on sign in:", error);
                        hasSyncedOnSignIn.current = false;
                    });
            }
        } else if (!isSignedIn && wasSignedIn && !hasHandledSignOut.current) {
            // 从登录变为未登录状态
            console.log("User just signed out, switching to local storage mode");
            hasHandledSignOut.current = true;
            hasSyncedOnSignIn.current = false;
            
            // 保留收藏数据，只更新同步状态
            useAppStore.setState({ 
                isOnline: false, 
                lastSynced: null,
                favoritesError: null,
                favoritesLoading: false
            });
        }
    }, [isSignedIn]);

    /**
     * 定期同步（仅在用户登录时）
     */
    useEffect(() => {
        if (!isSignedIn) {
            return;
        }

        // 每5分钟同步一次
        const syncInterval = setInterval(async () => {
            const service = favoritesServiceRef.current;
            if (service) {
                try {
                    await useAppStore.getState().syncFavorites(service);
                } catch (error) {
                    console.warn("Background sync failed:", error);
                }
            }
        }, 5 * 60 * 1000); // 5分钟

        return () => clearInterval(syncInterval);
    }, [isSignedIn]);

    /**
     * 网络状态监听（用于网络恢复后自动重试）
     */
    useEffect(() => {
        const handleOnline = async () => {
            const service = favoritesServiceRef.current;
            if (isSignedIn && service && !isOnline) {
                console.log("Network restored, attempting to sync favorites...");
                try {
                    await useAppStore.getState().syncFavorites(service);
                } catch (error) {
                    console.warn("Failed to sync after network restore:", error);
                }
            }
        };

        if (isClient) {
            window.addEventListener('online', handleOnline);
            return () => window.removeEventListener('online', handleOnline);
        }
    }, [isSignedIn, isOnline, isClient]);

    /**
     * 手动重试同步
     */
    const retrySync = useCallback(async () => {
        const service = favoritesServiceRef.current;
        if (service) {
            useAppStore.getState().clearFavoritesError();
            try {
                await useAppStore.getState().syncFavorites(service);
            } catch (error) {
                console.error("Retry sync failed:", error);
            }
        }
    }, []);

    /**
     * 强制同步（用于解决冲突）
     */
    const forceSync = useCallback(async () => {
        const service = favoritesServiceRef.current;
        if (service) {
            useAppStore.getState().clearFavoritesError();
            try {
                // 直接从云端获取最新数据
                const cloudFavorites = await service.getFavorites();
                const store = useAppStore.getState();
                store.setFavorites(cloudFavorites);
                useAppStore.setState({
                    isOnline: true,
                    lastSynced: new Date().toISOString(),
                    favoritesError: null
                });
            } catch (error) {
                console.error("Force sync failed:", error);
                useAppStore.setState({
                    favoritesError: error instanceof Error ? error.message : "Force sync failed"
                });
            }
        }
    }, []);

    return useMemo(() => ({
        isOnline,
        lastSynced,
        favoritesLoading,
        favoritesError,
        retrySync,
        forceSync,
        isSignedIn,
        hasService: !!favoritesServiceRef.current,
        syncEnabled: true
    }), [
        isOnline,
        lastSynced,
        favoritesLoading,
        favoritesError,
        retrySync,
        forceSync,
        isSignedIn
    ]);
}