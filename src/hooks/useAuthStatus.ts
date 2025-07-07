import { useState, useEffect } from 'react';

export type AuthState = 
  | 'not-authenticated'      // 用户未登录
  | 'authenticated-full';    // 用户已登录且功能完整

export interface AuthStatus {
  state: AuthState;
  isSignedIn: boolean;
  hasClerkFeatures: boolean;
  canSync: boolean;
  displayMessage: string | null;
}

/**
 * @hook useAuthStatus
 * @description 简化版的认证状态检测，专注于准确性和可靠性
 * 只区分两种状态：已登录和未登录
 */
export function useAuthStatus(): AuthStatus {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    state: 'not-authenticated',
    isSignedIn: false,
    hasClerkFeatures: false,
    canSync: false,
    displayMessage: 'Sign in to sync favorites across devices'
  });

  useEffect(() => {
    const checkAuthStatus = () => {
      const hasClerkKey = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
      const isClient = typeof window !== 'undefined';

      if (!hasClerkKey) {
        console.log('[AuthStatus] No Clerk key configured');
        setAuthStatus({
          state: 'not-authenticated',
          isSignedIn: false,
          hasClerkFeatures: false,
          canSync: false,
          displayMessage: 'Sign in to sync favorites across devices'
        });
        return;
      }

      if (!isClient) {
        console.log('[AuthStatus] Not in client environment');
        setAuthStatus({
          state: 'not-authenticated',
          isSignedIn: false,
          hasClerkFeatures: false,
          canSync: false,
          displayMessage: 'Sign in to sync favorites across devices'
        });
        return;
      }

      try {
        const clerkInstance = (window as any).Clerk;
        
        if (clerkInstance && clerkInstance.loaded) {
          const isSignedIn = !!clerkInstance.user;
          console.log('[AuthStatus] Clerk detected, user signed in:', isSignedIn);
          
          setAuthStatus({
            state: isSignedIn ? 'authenticated-full' : 'not-authenticated',
            isSignedIn,
            hasClerkFeatures: true,
            canSync: isSignedIn,
            displayMessage: isSignedIn ? null : 'Sign in to sync favorites across devices'
          });
        } else if (clerkInstance && !clerkInstance.loaded) {
          console.log('[AuthStatus] Clerk found but not loaded yet');
          // Clerk 正在加载中，保持未登录状态但标记有 Clerk 功能
          setAuthStatus({
            state: 'not-authenticated',
            isSignedIn: false,
            hasClerkFeatures: true,
            canSync: false,
            displayMessage: 'Sign in to sync favorites across devices'
          });
        } else {
          console.log('[AuthStatus] Clerk not found on window');
          // 没有找到 Clerk 实例，可能是 SSR 或配置问题
          setAuthStatus({
            state: 'not-authenticated',
            isSignedIn: false,
            hasClerkFeatures: false,
            canSync: false,
            displayMessage: 'Sign in to sync favorites across devices'
          });
        }
      } catch (error) {
        console.warn('[AuthStatus] Error checking Clerk status:', error);
        setAuthStatus({
          state: 'not-authenticated',
          isSignedIn: false,
          hasClerkFeatures: false,
          canSync: false,
          displayMessage: 'Sign in to sync favorites across devices'
        });
      }
    };

    // 立即检查一次
    checkAuthStatus();

    // 监听 Clerk 状态变化
    const setupClerkListener = () => {
      try {
        const clerkInstance = (window as any).Clerk;
        if (clerkInstance) {
          const handleUserChange = () => {
            console.log('[AuthStatus] Clerk user changed, rechecking status');
            checkAuthStatus();
          };

          clerkInstance.addListener('user', handleUserChange);
          return () => {
            clerkInstance.removeListener('user', handleUserChange);
          };
        }
      } catch (error) {
        console.warn('[AuthStatus] Failed to setup Clerk listener:', error);
      }
      return () => {};
    };

    const cleanup = setupClerkListener();

    // 如果 Clerk 还没有加载，设置轮询检查
    let pollInterval: NodeJS.Timeout | null = null;
    let pollTimeout: NodeJS.Timeout | null = null;

    if (typeof window !== 'undefined' && !(window as any).Clerk) {
      console.log('[AuthStatus] Starting Clerk detection polling');
      pollInterval = setInterval(checkAuthStatus, 1000);
      
      // 10秒后停止轮询
      pollTimeout = setTimeout(() => {
        if (pollInterval) {
          console.log('[AuthStatus] Stopping Clerk detection polling');
          clearInterval(pollInterval);
        }
      }, 10000);
    }

    return () => {
      cleanup();
      if (pollInterval) clearInterval(pollInterval);
      if (pollTimeout) clearTimeout(pollTimeout);
    };
  }, []);

  return authStatus;
}