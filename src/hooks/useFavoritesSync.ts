import { useEffect, useCallback, useRef, useMemo } from "react";
import { useUser } from "@clerk/clerk-react";
import { useAppStore } from "../store/useAppStore";
import { useSupabaseFavoritesService } from "../services/supabase-favorites";

/**
 * @hook useFavoritesSync
 * @description 处理收藏功能的同步逻辑，包括登录状态变化时的数据迁移和自动同步
 */
export function useFavoritesSync() {
    // Check if we're in a client environment to avoid SSR issues
    const isClient = typeof window !== 'undefined';
    const { isSignedIn } = isClient ? useUser() : { isSignedIn: false };
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
                useAppStore.getState().syncFavorites(service)
                    .then(() => {
                        hasSyncedOnSignIn.current = true;
                    })
                    .catch(error => {
                        console.error("Failed to sync favorites on sign in:", error);
                        hasSyncedOnSignIn.current = false;
                    });
            }
        } else if (!isSignedIn && wasSignedIn && !hasHandledSignOut.current) {
            // 从登录变为未登录状态
            console.log("User just signed out, clearing favorites and switching to local storage mode");
            hasHandledSignOut.current = true;
            hasSyncedOnSignIn.current = false;
            
            // 清除收藏数据和相关状态
            useAppStore.setState({ 
                favorites: new Set<string>(),
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

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [isSignedIn, isOnline]);

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
        hasService: !!favoritesServiceRef.current
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