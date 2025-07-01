import React, { ReactNode } from 'react';
import { useIsClient } from '~/hooks/useIsClient';

interface ClientOnlyProps {
  /**
   * 只在客户端渲染的内容
   */
  children: ReactNode;
  
  /**
   * 服务端渲染时显示的回退内容
   * 默认为null（不显示任何内容）
   */
  fallback?: ReactNode;
  
  /**
   * 延迟显示时间（毫秒）
   * 用于处理某些需要延迟渲染的情况
   */
  delay?: number;
}

/**
 * ClientOnly组件
 * 
 * 用于确保某些内容只在客户端渲染，避免SSR水合不匹配问题
 * 
 * 使用场景：
 * - 包含浏览器特定API的组件
 * - 依赖window/document对象的组件
 * - 客户端状态管理相关的内容
 * - 第三方库组件（可能不支持SSR）
 * 
 * @example
 * ```tsx
 * <ClientOnly fallback={<div>Loading...</div>}>
 *   <InteractiveChart />
 * </ClientOnly>
 * ```
 */
export const ClientOnly: React.FC<ClientOnlyProps> = ({
  children,
  fallback = null,
  delay = 0
}) => {
  const isClient = useIsClient();

  // 处理延迟渲染
  const [isReady, setIsReady] = React.useState(delay === 0);

  React.useEffect(() => {
    if (isClient && delay > 0) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isClient, delay]);

  // 服务端或客户端未准备好时显示fallback
  if (!isClient || !isReady) {
    return <>{fallback}</>;
  }

  // 客户端渲染内容
  return <>{children}</>;
};

/**
 * NoSSR组件 (ClientOnly的别名)
 * 
 * 更直观的组件名，表明此组件不参与SSR
 */
export const NoSSR = ClientOnly;

/**
 * 高阶组件：为组件添加客户端只渲染功能
 * 
 * @param Component 要包装的组件
 * @param fallback 服务端回退内容
 * @returns 包装后的组件
 * 
 * @example
 * ```tsx
 * const ClientOnlyChart = withClientOnly(Chart, <div>Loading chart...</div>);
 * ```
 */
export const withClientOnly = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ClientOnly fallback={fallback}>
      <Component {...props} />
    </ClientOnly>
  );

  WrappedComponent.displayName = `withClientOnly(${Component.displayName || Component.name})`;

  return WrappedComponent;
};