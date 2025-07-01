import { useEffect, useState } from 'react';

/**
 * Hook用于检测组件是否已在客户端挂载
 * 
 * 这个Hook解决了SSR水合不匹配的问题：
 * - 服务端渲染时返回false
 * - 客户端水合后返回true
 * 
 * 使用场景：
 * - 需要在组件中区分服务端和客户端渲染
 * - 避免SSR和客户端渲染不一致的问题
 * - 处理只能在客户端运行的代码
 */
export const useIsClient = (): boolean => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // useEffect只在客户端运行
    setIsClient(true);
  }, []);

  return isClient;
};

/**
 * Hook用于检测是否为首次客户端渲染
 * 
 * 在SSR应用中：
 * - 首次加载时，isFirstRender为true
 * - 后续客户端路由跳转时，isFirstRender为false
 */
export const useIsFirstRender = (): boolean => {
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  return isFirstRender;
};

/**
 * Hook用于安全地访问Window对象
 * 
 * @returns Window对象或undefined（在服务端）
 */
export const useWindow = (): Window | undefined => {
  const isClient = useIsClient();
  return isClient ? window : undefined;
};

/**
 * Hook用于延迟显示内容直到客户端挂载
 * 
 * @param delay 延迟时间（毫秒）
 * @returns 是否应该显示内容
 */
export const useClientReady = (delay: number = 0): boolean => {
  const [isReady, setIsReady] = useState(false);
  const isClient = useIsClient();

  useEffect(() => {
    if (isClient) {
      if (delay > 0) {
        const timer = setTimeout(() => setIsReady(true), delay);
        return () => clearTimeout(timer);
      } else {
        setIsReady(true);
      }
    }
  }, [isClient, delay]);

  return isReady;
};