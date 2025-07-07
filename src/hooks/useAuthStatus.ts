import { useMemo } from 'react';

export type AuthState = 
  | 'not-authenticated'      // 用户未登录
  | 'authenticated-limited'  // 用户已登录但Clerk功能受限  
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
 * @description 智能检测用户认证状态，区分三种情况：
 * 1. 未登录
 * 2. 已登录但Clerk功能受限（生产环境配置问题等）
 * 3. 已登录且功能完整
 */
export function useAuthStatus(): AuthStatus {
  return useMemo(() => {
    const isClient = typeof window !== 'undefined';
    const hasClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
    
    // 检查是否在ClerkProvider环境中
    let hasClerkProvider = false;
    let actuallySignedIn = false;
    
    if (isClient && hasClerkKey) {
      try {
        // 尝试检测Clerk是否可用
        const clerkInstance = (window as any).Clerk;
        if (clerkInstance) {
          hasClerkProvider = true;
          // 尝试获取用户状态
          actuallySignedIn = clerkInstance.user ? true : false;
        }
      } catch (error) {
        console.warn('Failed to detect Clerk status:', error);
        hasClerkProvider = false;
      }
    }
    
    // 确定认证状态
    let state: AuthState;
    let displayMessage: string | null = null;
    
    if (!hasClerkKey) {
      // 没有配置Clerk
      state = 'not-authenticated';
      displayMessage = 'Sign in to sync favorites across devices';
    } else if (hasClerkProvider && actuallySignedIn) {
      // 已登录且功能完整
      state = 'authenticated-full';
      displayMessage = null;
    } else if (hasClerkProvider && !actuallySignedIn) {
      // 有Clerk但未登录
      state = 'not-authenticated'; 
      displayMessage = 'Sign in to sync favorites across devices';
    } else {
      // 有Clerk配置但功能受限（可能是SSR模式或其他技术原因）
      state = 'authenticated-limited';
      displayMessage = 'Limited sync features - sign in on a supported device';
    }
    
    return {
      state,
      isSignedIn: actuallySignedIn,
      hasClerkFeatures: hasClerkProvider,
      canSync: state === 'authenticated-full',
      displayMessage
    };
  }, []);
}