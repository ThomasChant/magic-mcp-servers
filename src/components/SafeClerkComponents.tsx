import React from 'react';

/**
 * SafeClerkWrapper - 安全包装器，只在有 Clerk 环境时渲染子组件
 */
export const SafeClerkWrapper: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
    children, 
    fallback = null 
}) => {
    // 检查是否在客户端且有 Clerk 环境变量
    const isClient = typeof window !== 'undefined';
    const hasClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
    
    if (!isClient || !hasClerkKey) {
        return <>{fallback}</>;
    }
    
    // 进一步检查 window.Clerk 是否存在
    if (typeof window !== 'undefined' && !(window as any).Clerk) {
        return <>{fallback}</>;
    }
    
    return <>{children}</>;
};

/**
 * useClerkSafe - 安全的 Clerk hooks 包装器
 */
export function useClerkSafe() {
    const isClient = typeof window !== 'undefined';
    const hasClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
    const hasClerkInstance = isClient && (window as any).Clerk;
    
    const isClerkAvailable = isClient && hasClerkKey && hasClerkInstance;
    
    return {
        isClerkAvailable,
        safeUser: isClerkAvailable ? { isSignedIn: false } : { isSignedIn: false },
        safeOpenSignIn: () => {
            if (isClerkAvailable && (window as any).Clerk) {
                // 可以安全地调用 Clerk 方法
                console.log('Would open sign in modal');
            }
        }
    };
}